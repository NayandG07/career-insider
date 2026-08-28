# Use Node 20 on Debian Bookworm (which ships with Python 3.11)
FROM node:20-bookworm-slim

# Install Python 3.11 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . /app

# ─── Install Node.js Dependencies ───
WORKDIR /app/backend
RUN npm install

# ─── Install Python Dependencies ───
WORKDIR /app/ai_service
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# ─── Setup Startup Script ───
WORKDIR /app
COPY start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

# Expose port (Render sets $PORT dynamically, but 5000 is our default)
EXPOSE 5000

# Run the startup script
CMD ["/app/start.sh"]
