import { useMemo } from "react";
import {
  ROOM_NUMBERS,
  formatMonthYear,
  getCalendarGridDays,
  isRoomBookedOnDate,
} from "../lib/bookingLogic.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthlyCalendar({
  year,
  monthIndex,
  selectedDateKey,
  todayKey,
  bookings,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) {
  const days = useMemo(
    () => getCalendarGridDays(year, monthIndex),
    [year, monthIndex]
  );

  const bookedCountByDate = useMemo(() => {
    const counts = new Map();
    for (const cell of days) {
      const occupiedRooms = new Set();
      for (const booking of bookings) {
        if (isRoomBookedOnDate(booking, cell.dateKey)) {
          occupiedRooms.add(booking.roomNumber);
        }
      }
      counts.set(cell.dateKey, occupiedRooms.size);
    }
    return counts;
  }, [days, bookings]);

  return (
    <section
      aria-label="Monthly Booking Calendar"
      className="rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#243B53]">
            {formatMonthYear(year, monthIndex)}
          </h2>
          <p className="text-xs text-[#243B53]/65">
            Select a date to view availability for all 7 rooms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToToday}
            className="rounded-lg border border-[#43A6A1]/50 px-3 py-1.5 text-xs font-medium text-[#243B53] hover:bg-[#43A6A1]/15"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="rounded-lg border border-[#243B53]/20 px-3 py-1.5 text-sm font-medium text-[#243B53] hover:bg-[#243B53]/10"
          >
            ←
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="rounded-lg border border-[#243B53]/20 px-3 py-1.5 text-sm font-medium text-[#243B53] hover:bg-[#243B53]/10"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="py-1.5 text-xs font-semibold uppercase tracking-wider text-[#243B53]/60"
          >
            {weekday}
          </div>
        ))}

        {days.map((cell) => {
          const bookedCount = bookedCountByDate.get(cell.dateKey) ?? 0;
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;
          const allBooked = bookedCount === ROOM_NUMBERS.length;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDate(cell.dateKey)}
              className={[
                "flex min-h-[60px] flex-col items-center justify-between rounded-lg border p-1.5 text-left sm:min-h-[68px] sm:p-2",
                isSelected
                  ? "border-[#243B53] bg-[#243B53] text-[#F7F5F0]"
                  : isToday
                    ? "border-[#43A6A1] bg-[#43A6A1]/15 text-[#243B53]"
                    : cell.inCurrentMonth
                      ? "border-[#243B53]/15 bg-[#F7F5F0] text-[#243B53] hover:border-[#43A6A1]"
                      : "border-[#243B53]/10 bg-[#F7F5F0] text-[#243B53]/35 hover:border-[#243B53]/25",
              ].join(" ")}
            >
              <span className="self-start text-xs font-semibold tabular-nums sm:text-sm">
                {cell.dayOfMonth}
              </span>

              <span
                className={[
                  "mt-1 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums sm:text-[11px]",
                  isSelected
                    ? "bg-[#F7F5F0]/15 text-[#F7F5F0]"
                    : bookedCount > 0
                      ? allBooked
                        ? "bg-[#243B53] text-[#F7F5F0]"
                        : "bg-[#243B53]/10 text-[#243B53]"
                      : "bg-[#43A6A1]/15 text-[#243B53]/75",
                ].join(" ")}
              >
                {bookedCount}/{ROOM_NUMBERS.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#243B53]/10 pt-3 text-xs text-[#243B53]/75">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#243B53]" />
          Selected date
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-[#43A6A1] bg-[#43A6A1]/20" />
          Today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded bg-[#243B53]/10 px-1 text-[10px] font-medium text-[#243B53]">
            N/7
          </span>
          Rooms booked
        </span>
      </div>
    </section>
  );
}
