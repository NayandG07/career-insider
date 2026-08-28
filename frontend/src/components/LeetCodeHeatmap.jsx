import React, { useMemo, useEffect, useRef } from 'react';

/**
 * Dynamic LeetCode & GitHub Activity Heatmap
 * Renders a 52-week contribution grid using real timestamp data from submissionCalendar.
 */
export default function LeetCodeHeatmap({ 
  submissionCalendar = {}, 
  totalPastYearSubmissions = 0, 
  totalActiveDays = 0,
  unitName = 'submissions',
  timeRangeText = `in ${new Date().getFullYear()}`,
  sideContent = null,
  leftContent = null
}) {
  const rightContent = sideContent || leftContent;
  const containerRef = useRef(null);

  // Automatically scroll container to the rightmost position on mount and data change
  useEffect(() => {
    const scrollToRight = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    };
    scrollToRight();
    const timer = setTimeout(scrollToRight, 50);
    return () => clearTimeout(timer);
  }, [submissionCalendar]);
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
        // LeetCode timestamps are UTC seconds (e.g. 1760572800 -> 2025-10-16)
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

  // Generate 52 weeks grid (364 days ending today)
  const { weeks, monthLabels, computedStats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay(); // 0 is Sun

    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays + (6 - dayOfWeek));

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

      const checkDate = new Date(cur);
      checkDate.setHours(0, 0, 0, 0);
      const isFuture = checkDate > today;

      if (count > 0 && !isFuture) {
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
        
        // Month label change
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
  }, [calendarData]);

  // Intensity color
  const getCellColor = (count) => {
    if (count === 0) return 'bg-[#F3F4F6] border-[#E5E9F0]';
    if (count <= 2) return 'bg-emerald-200 border-emerald-300';
    if (count <= 4) return 'bg-emerald-400 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700';
  };

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-xs space-y-4 text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#111827]">
              {totalSubmissions.toLocaleString()} {unitName}
            </span>
            <span className="text-xs text-[#6B7280] font-semibold">{timeRangeText}</span>
          </div>
        </div>

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

      {/* Heatmap Grid Container */}
      <div ref={containerRef} className="overflow-x-auto pb-1 no-scrollbar">
        <div className="min-w-[760px] flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          {/* Heatmap Grid on Left */}
          <div className="w-[760px] shrink-0">
            
            {/* Month Header Axis */}
            <div className="w-[725px] text-[10px] font-bold text-[#9CA3AF] mb-1.5 h-4 relative ml-[28px]">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{ left: `${(m.weekIndex / 52) * 100}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid Layout */}
            <div className="flex gap-1.5 items-start">
              {/* Days labels */}
              <div className="w-[22px] flex flex-col justify-between text-[9px] font-bold text-[#9CA3AF] h-[84px] pr-1 select-none">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Week Columns */}
              <div className="flex gap-[3px] w-[725px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dIdx) => {
                      if (day.isFuture) {
                        return (
                          <div
                            key={dIdx}
                            className="w-[11px] h-[11px] opacity-0 pointer-events-none"
                          />
                        );
                      }
                      return (
                        <div
                          key={dIdx}
                          title={`${day.count} submission${day.count === 1 ? '' : 's'} on ${day.displayDate}`}
                          className={`w-[11px] h-[11px] rounded-[2px] border ${getCellColor(day.count)} transition-all hover:scale-125 hover:z-10 cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Legend */}
            <div className="flex items-center justify-between mt-3 text-[10px] font-semibold text-[#9CA3AF] pt-2 border-t border-[#F3F4F6]">
              <span>Activity distribution</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#F3F4F6] border border-[#E5E9F0]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 border border-emerald-300" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-500" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-700" />
                <span>More</span>
              </div>
            </div>

          </div>

          {/* Rightmost Side Content Panel */}
          {rightContent ? (
            <div className="flex-1 min-w-[220px] w-full self-stretch flex flex-col justify-between py-1 border-l border-[#F3F4F6] pl-5">
              {rightContent}
            </div>
          ) : null}
        </div>
      </div>

    </div>
  );
}
