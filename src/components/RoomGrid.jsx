import { countNights, formatDisplayDate } from "../lib/bookingLogic.js";

export default function RoomGrid({
  selectedDateKey,
  roomStatuses,
  onSelectAvailableRoom,
  onSelectBookedRoom,
}) {
  const availableCount = roomStatuses.filter((r) => !r.booking).length;
  const bookedCount = roomStatuses.length - availableCount;

  return (
    <section
      aria-label="Rooms Availability"
      className="rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-5"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#243B53]/10 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-[#243B53]">
            Rooms · {formatDisplayDate(selectedDateKey)}
          </h2>
          <p className="text-xs text-[#243B53]/65">
            Click an available room to book, or a booked room to edit/cancel
          </p>
        </div>
        <p className="text-xs font-medium text-[#243B53]/80">
          <span className="text-[#43A6A1]">{availableCount} Available</span>
          {" · "}
          <span>{bookedCount} Booked</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {roomStatuses.map(({ roomNumber, booking }) => {
          const isBooked = Boolean(booking);

          if (!isBooked) {
            return (
              <button
                key={roomNumber}
                type="button"
                onClick={() => onSelectAvailableRoom(roomNumber)}
                className="flex w-full items-center justify-between rounded-xl border border-[#43A6A1]/40 bg-[#F7F5F0] p-4 text-left hover:border-[#43A6A1] hover:bg-[#43A6A1]/10"
              >
                <div>
                  <p className="text-base font-semibold tabular-nums text-[#243B53]">
                    Room {roomNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-[#243B53]/65">
                    Click to create a booking
                  </p>
                </div>
                <span className="rounded-full bg-[#43A6A1] px-3 py-1 text-xs font-medium text-[#F7F5F0]">
                  Available
                </span>
              </button>
            );
          }

          const nights = countNights(booking.checkInDate, booking.checkOutDate);

          return (
            <button
              key={roomNumber}
              type="button"
              onClick={() => onSelectBookedRoom(booking)}
              className="w-full rounded-xl border border-[#243B53]/25 bg-[#243B53]/5 p-4 text-left hover:border-[#243B53]/50 hover:bg-[#243B53]/10"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold tabular-nums text-[#243B53]">
                  Room {roomNumber}
                </p>
                <span className="rounded-full bg-[#243B53] px-3 py-1 text-xs font-medium text-[#F7F5F0]">
                  Booked
                </span>
              </div>

              <div className="mt-2.5 space-y-1 text-xs text-[#243B53]/85">
                <p className="text-sm font-medium text-[#243B53]">
                  {booking.guestName}
                </p>
                <p>
                  {formatDisplayDate(booking.checkInDate)} →{" "}
                  {formatDisplayDate(booking.checkOutDate)} ({nights}{" "}
                  {nights === 1 ? "night" : "nights"})
                </p>
                <p className="text-[#243B53]/70">
                  {booking.guestsCount}{" "}
                  {booking.guestsCount === 1 ? "guest" : "guests"} ·{" "}
                  {booking.phoneNumber}
                </p>
                {booking.amount !== null && (
                  <p className="text-[#243B53]/70">
                    Amount: {booking.amount.toLocaleString()}
                  </p>
                )}
                {booking.notes && (
                  <p className="truncate text-[#243B53]/65">
                    Note: {booking.notes}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
