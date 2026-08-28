/**
 * CareerOS Modern Backend Logger
 * Zero-dependency, ANSI-colored, structured logging for operations & heavy tasks.
 */

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright / High-Intensity
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background colors
  bgCyan: '\x1b[46m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
};

function getTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

function formatTag(tag, color = colors.brightCyan) {
  return `${colors.gray}[${getTimestamp()}]${colors.reset} ${color}${colors.bold}[${tag}]${colors.reset}`;
}

export const logger = {
  info(tag, message, meta = '') {
    const metaStr = meta ? ` ${colors.gray}${typeof meta === 'object' ? JSON.stringify(meta) : meta}${colors.reset}` : '';
    console.log(`${formatTag(tag, colors.brightCyan)} ℹ️  ${message}${metaStr}`);
  },

  success(tag, message, meta = '') {
    const metaStr = meta ? ` ${colors.gray}${typeof meta === 'object' ? JSON.stringify(meta) : meta}${colors.reset}` : '';
    console.log(`${formatTag(tag, colors.brightGreen)} ✅ ${colors.green}${message}${colors.reset}${metaStr}`);
  },

  warn(tag, message, meta = '') {
    const metaStr = meta ? ` ${colors.gray}${typeof meta === 'object' ? JSON.stringify(meta) : meta}${colors.reset}` : '';
    console.log(`${formatTag(tag, colors.brightYellow)} ⚠️  ${colors.yellow}${message}${colors.reset}${metaStr}`);
  },

  error(tag, message, err = null) {
    const errDetails = err ? (err.stack || err.message || JSON.stringify(err)) : '';
    console.error(`${formatTag(tag, colors.brightRed)} ❌ ${colors.brightRed}${message}${colors.reset}`);
    if (errDetails) {
      console.error(`   ${colors.red}${errDetails}${colors.reset}`);
    }
  },

  /**
   * Start a timed task and return completion hooks
   * @param {string} category e.g. 'AI SKILLS', 'ROADMAP', 'GITHUB', 'SYNC'
   * @param {string} taskName e.g. 'Skill Analysis'
   * @param {object|string} initialDetails
   */
  startTask(category, taskName, initialDetails = {}) {
    const start = performance.now();
    const detailsStr = typeof initialDetails === 'object' && Object.keys(initialDetails).length > 0
      ? ` (${Object.entries(initialDetails).map(([k, v]) => `${k}: ${v}`).join(', ')})`
      : (typeof initialDetails === 'string' && initialDetails ? ` (${initialDetails})` : '');

    console.log(`${formatTag(category, colors.brightMagenta)} 🚀 Starting ${colors.bold}${taskName}${colors.reset}${colors.gray}${detailsStr}${colors.reset}`);

    return {
      success: (summary = '') => {
        const duration = ((performance.now() - start) / 1000).toFixed(2);
        const sumStr = summary
          ? (typeof summary === 'object' ? Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join(', ') : summary)
          : 'Completed successfully';
        console.log(`${formatTag(category, colors.brightGreen)} ✨ ${colors.bold}${taskName}${colors.reset} finished in ${colors.brightYellow}${duration}s${colors.reset} | ${colors.white}${sumStr}${colors.reset}`);
      },
      error: (err, customMsg = '') => {
        const duration = ((performance.now() - start) / 1000).toFixed(2);
        const msg = customMsg || `${taskName} failed`;
        console.error(`${formatTag(category, colors.brightRed)} 💥 ${colors.bold}${msg}${colors.reset} after ${duration}s: ${err?.message || err}`);
      }
    };
  },

  /**
   * Express HTTP Request Logging Middleware
   */
  httpMiddleware(req, res, next) {
    const start = performance.now();
    const { method, originalUrl } = req;

    // Ignore health check from noisy logging
    if (originalUrl === '/api/health') {
      return next();
    }

    res.on('finish', () => {
      const duration = ((performance.now() - start)).toFixed(0);
      const status = res.statusCode;

      let statusColor = colors.brightGreen;
      if (status >= 500) statusColor = colors.brightRed;
      else if (status >= 400) statusColor = colors.brightYellow;
      else if (status >= 300) statusColor = colors.brightCyan;

      let methodColor = colors.brightBlue;
      if (method === 'POST') methodColor = colors.brightMagenta;
      else if (method === 'PUT' || method === 'PATCH') methodColor = colors.brightYellow;
      else if (method === 'DELETE') methodColor = colors.brightRed;

      const userIdentifier = req.user ? `${colors.gray}[${req.user.email || req.user.name || req.user._id}]${colors.reset}` : '';

      console.log(
        `${colors.gray}[${getTimestamp()}]${colors.reset} ` +
        `${methodColor}${colors.bold}${method.padEnd(6)}${colors.reset} ` +
        `${colors.white}${originalUrl.padEnd(32)}${colors.reset} ` +
        `${statusColor}${colors.bold}${status}${colors.reset} ` +
        `${colors.gray}(${duration}ms)${colors.reset} ` +
        `${userIdentifier}`
      );
    });

    next();
  }
};

export default logger;
