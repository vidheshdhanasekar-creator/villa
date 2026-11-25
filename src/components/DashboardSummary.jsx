import { formatDisplayDate } from "../lib/bookingLogic.js";

export default function DashboardSummary({
  summary,
  selectedDateKey,
  onSelectBooking,
}) {
  return (
    <section aria-label="Residency Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div className="rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#243B53]/65">
          Total Rooms
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#243B53]">
          {summary.totalRooms}
        </p>
        <p className="mt-1 text-xs text-[#243B53]/65">Rooms 101–107</p>
      </div>

      <div className="rounded-xl border border-[#43A6A1]/40 bg-[#43A6A1]/10 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#243B53]/75">
          Available
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#43A6A1]">
          {summary.availableCount}
        </p>
        <p className="mt-1 text-xs text-[#243B53]/70">
          {formatDisplayDate(selectedDateKey)}
        </p>
      </div>

      <div className="rounded-xl border border-[#243B53]/20 bg-[#243B53]/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#243B53]/70">
          Booked
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#243B53]">
          {summary.bookedCount}
        </p>
        <p className="mt-1 text-xs text-[#243B53]/65">
          {formatDisplayDate(selectedDateKey)}
        </p>
      </div>

      <div className="rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#243B53]/65">
          Today&apos;s Check-ins
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#43A6A1]">
          {summary.todaysCheckIns.length}
        </p>
        {summary.todaysCheckIns.length === 0 ? (
          <p className="mt-1 text-xs text-[#243B53]/60">None scheduled</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {summary.todaysCheckIns.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => onSelectBooking(booking)}
                className="rounded border border-[#43A6A1]/40 bg-[#43A6A1]/10 px-1.5 py-0.5 text-xs text-[#243B53] hover:bg-[#43A6A1]/20"
              >
                {booking.roomNumber} · {booking.guestName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-4 sm:col-span-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[#243B53]/65">
          Today&apos;s Check-outs
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#243B53]">
          {summary.todaysCheckOuts.length}
        </p>
        {summary.todaysCheckOuts.length === 0 ? (
          <p className="mt-1 text-xs text-[#243B53]/60">None scheduled</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {summary.todaysCheckOuts.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => onSelectBooking(booking)}
                className="rounded border border-[#243B53]/20 bg-[#243B53]/5 px-1.5 py-0.5 text-xs text-[#243B53] hover:bg-[#243B53]/10"
              >
                {booking.roomNumber} · {booking.guestName}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
