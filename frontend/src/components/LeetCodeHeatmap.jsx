import React, { useMemo, useEffect, useRef } from 'react';

/**
 * Dynamic LeetCode & GitHub Activity Heatmap
 * Exact 52-week rolling contribution grid ending on the current week (most recent date at the rightmost edge),
 * taking the full allocated width of its container with pinned, always-visible day labels.
 */
export default function LeetCodeHeatmap({ 
  submissionCalendar = {}, 
  totalPastYearSubmissions = 0, 
  totalActiveDays = 0,
  unitName = 'submissions',
  timeRangeText = `in the last year`,
  sideContent = null,
  leftContent = null,
  targetYear = null,
  years = [],
  selectedYear = null,
  onYearSelect = null,
}) {
  const rightContent = sideContent || leftContent;
  const containerRef = useRef(null);

  // Normalize timestamp map into date string map (YYYY-MM-DD -> count)
  const calendarData = useMemo(() => {
    let raw = submissionCalendar;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }

    const map = {};
    if (!raw || typeof raw !== 'object') return map;

    for (const [ts, count] of Object.entries(raw)) {
      const numTs = Number(ts);
      if (!isNaN(numTs) && numTs > 0) {
        const d = new Date(numTs * 1000);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        map[key] = (map[key] || 0) + Number(count);
      } else if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}/.test(ts)) {
        const key = ts.slice(0, 10);
        map[key] = (map[key] || 0) + Number(count);
      }
    }
    return map;
  }, [submissionCalendar]);

  // Derived accurate metrics
  const { totalSubmissions, activeDays } = useMemo(() => {
    const values = Object.values(calendarData);
    const computedTotal = values.reduce((sum, c) => sum + (Number(c) || 0), 0);
    const computedDays = values.filter(c => Number(c) > 0).length;

    return {
      totalSubmissions: totalPastYearSubmissions || computedTotal,
      activeDays: totalActiveDays || computedDays,
    };
  }, [calendarData, totalPastYearSubmissions, totalActiveDays]);

  // Generate exact 52 weeks grid (Sun to Sat rows 0-6) ending today (rightmost edge)
  const { weeks, monthLabels, computedStats } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const isPastCompletedYear = targetYear && targetYear < today.getFullYear();
    let startDate;
    let totalDays = 52 * 7;

    if (isPastCompletedYear) {
      // Completed past calendar year (e.g. 2025 Jan 1 to Dec 31)
      const jan1 = new Date(targetYear, 0, 1);
      const dayOfWeek = jan1.getDay();
      startDate = new Date(jan1);
      startDate.setDate(startDate.getDate() - dayOfWeek);
    } else {
      // 52 rolling weeks ending on the current week (most recent date is at the rightmost end)
      const dayOfWeek = today.getDay(); // 0 is Sun
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (51 * 7 + dayOfWeek));
    }

    const weeksArr = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;

    let maxStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;
    let isCurrentStreakActive = true;

    // Scan backwards from today to find current streak
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const count = calendarData[key] || 0;

      if (count > 0 && isCurrentStreakActive) {
        currentStreak++;
      } else if (i > 0) {
        isCurrentStreakActive = false;
      }
    }

    // Generate weeks forward
    const cur = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const yyyy = cur.getFullYear();
      const m = cur.getMonth();
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const count = calendarData[dateKey] || 0;
      const isFuture = cur > today;

      if (count > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      currentWeek.push({
        date: dateKey,
        count,
        displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isFuture,
      });

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        
        // Month label change across the weeks
        const firstDayOfWeekMonth = cur.getMonth();
        if (firstDayOfWeekMonth !== lastMonth) {
          months.push({
            weekIndex: weeksArr.length - 1,
            label: cur.toLocaleDateString('en-US', { month: 'short' }),
          });
          lastMonth = firstDayOfWeekMonth;
        }
        currentWeek = [];
      }

      cur.setDate(cur.getDate() + 1);
    }

    return {
      weeks: weeksArr,
      monthLabels: months,
      computedStats: {
        maxStreak,
        currentStreak,
      },
    };
  }, [calendarData, targetYear]);

  // Automatically scroll container to rightmost so today is in full view
  useEffect(() => {
    const isPastCompletedYear = targetYear && targetYear < new Date().getFullYear();
    const handleScroll = () => {
      if (containerRef.current) {
        if (isPastCompletedYear) {
          containerRef.current.scrollLeft = 0;
        } else {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
      }
    };
    handleScroll();
    const t1 = setTimeout(handleScroll, 50);
    const t2 = setTimeout(handleScroll, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [weeks, selectedYear, targetYear]);

  // Intensity color
  const getCellColor = (count, isFuture) => {
    if (isFuture) return 'invisible pointer-events-none';
    if (count === 0) return 'bg-[#EEF2F6] border-[#E2E8F0]';
    if (count <= 2) return 'bg-emerald-200 border-emerald-300';
    if (count <= 4) return 'bg-emerald-400 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700';
  };

  const hasYearsSwitcher = Boolean(years && years.length > 0 && onYearSelect);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left w-full max-w-full overflow-hidden flex flex-col justify-between gap-4">
      
      {/* Header Info: Metric Count (Left) | Centered Year Tabs (Center) | Streaks (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E9F0] pb-3">
        
        {/* Left: Metric count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#111827]">
            {totalSubmissions.toLocaleString()} {unitName}
          </span>
          {!hasYearsSwitcher && timeRangeText && (
            <span className="text-xs text-[#6B7280] font-semibold">{timeRangeText}</span>
          )}
        </div>

        {/* Center: Year Switcher Tabs */}
        {hasYearsSwitcher && (
          <div className="flex items-center justify-center mx-auto bg-[#EEF2F6] p-0.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
            {years.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onYearSelect(yr)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-white text-[#7C3AED] shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        {/* Right: Active Days & Streaks */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#6B7280]">
          <div>
            <span>Total active days: </span>
            <span className="font-bold text-[#111827]">{activeDays}</span>
          </div>
          <div>
            <span>Max streak: </span>
            <span className="font-bold text-emerald-700">{computedStats.maxStreak} days</span>
          </div>
          {computedStats.currentStreak > 0 && (
            <div>
              <span>Current: </span>
              <span className="font-bold text-[#7C3AED]">{computedStats.currentStreak} days</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body: Full Width Heatmap Grid + Side Panel */}
      <div className="flex flex-col xl:flex-row items-stretch justify-between gap-5 w-full max-w-full">
        
        {/* Heatmap Section */}
        <div className="flex-1 min-w-0 max-w-full flex flex-col justify-between h-full">
          <div className="flex items-start gap-1 w-full max-w-full">
            
            {/* Always Visible Days Labels (Sun=Row0 to Sat=Row6) */}
            <div className="pt-[20px] shrink-0">
              <div className="flex flex-col text-[9px] font-bold text-[#9CA3AF] select-none pr-1.5" style={{ gap: '3.5px' }}>
                <div className="h-[13px] flex items-center justify-end leading-none invisible">Sun</div>
                <div className="h-[13px] flex items-center justify-end leading-none">Mon</div>
                <div className="h-[13px] flex items-center justify-end leading-none invisible">Tue</div>
                <div className="h-[13px] flex items-center justify-end leading-none">Wed</div>
                <div className="h-[13px] flex items-center justify-end leading-none invisible">Thu</div>
                <div className="h-[13px] flex items-center justify-end leading-none">Fri</div>
                <div className="h-[13px] flex items-center justify-end leading-none invisible">Sat</div>
              </div>
            </div>

            {/* Horizontally Scrollable 52-Week Grid */}
            <div ref={containerRef} className="flex-1 min-w-0 overflow-x-auto pb-1 no-scrollbar">
              <div className="w-max">
                {/* Month Labels Axis */}
                <div className="w-[680px] text-[10px] font-bold text-[#9CA3AF] mb-1.5 h-3.5 relative">
                  {monthLabels.map((m, idx) => (
                    <span
                      key={idx}
                      className="absolute"
                      style={{ left: `${(m.weekIndex / Math.max(1, weeks.length)) * 100}%` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* 52 Week Columns */}
                <div className="flex gap-[3.5px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3.5px]">
                      {week.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          title={day.isFuture ? '' : `${day.count} ${unitName} on ${day.displayDate}`}
                          className={`w-[11.5px] h-[13px] rounded-[2.5px] border ${getCellColor(day.count, day.isFuture)} transition-all hover:scale-125 hover:z-10 cursor-pointer`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Legend */}
          <div className="flex items-center justify-between mt-4 text-[10px] font-semibold text-[#9CA3AF] pt-2.5 border-t border-[#E5E9F0]">
            <span>Activity distribution</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#EEF2F6] border border-[#E2E8F0]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 border border-emerald-300" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-500" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-700" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Rightmost Side Content Panel (Latest Commit Logs) */}
        {rightContent ? (
          <div className="w-full xl:w-[360px] 2xl:w-[400px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#E5E9F0] pt-4 xl:pt-0 xl:pl-6 flex flex-col justify-between">
            {rightContent}
          </div>
        ) : null}

      </div>

    </div>
  );
}
