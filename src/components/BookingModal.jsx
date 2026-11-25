import { useEffect, useState } from "react";
import {
  ROOM_NUMBERS,
  addDays,
  countNights,
  validateBookingInput,
} from "../lib/bookingLogic.js";

export default function BookingModal({
  isOpen,
  initialBooking,
  defaultRoomNumber,
  defaultCheckInDate,
  existingBookings,
  onSave,
  onCancelBooking,
  onClose,
}) {
  const isEditing = Boolean(initialBooking);

  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("101");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestsCount, setGuestsCount] = useState("1");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialBooking) {
      setGuestName(initialBooking.guestName);
      setPhoneNumber(initialBooking.phoneNumber);
      setRoomNumber(initialBooking.roomNumber);
      setCheckInDate(initialBooking.checkInDate);
      setCheckOutDate(initialBooking.checkOutDate);
      setGuestsCount(String(initialBooking.guestsCount));
      setAmount(
        initialBooking.amount === null || initialBooking.amount === undefined
          ? ""
          : String(initialBooking.amount)
      );
      setNotes(initialBooking.notes ?? "");
    } else {
      setGuestName("");
      setPhoneNumber("");
      setRoomNumber(defaultRoomNumber || "101");
      setCheckInDate(defaultCheckInDate);
      setCheckOutDate(addDays(defaultCheckInDate, 1));
      setGuestsCount("1");
      setAmount("");
      setNotes("");
    }
    setError("");
    setSubmitting(false);
    setConfirmingDelete(false);
  }, [isOpen, initialBooking, defaultRoomNumber, defaultCheckInDate]);

  if (!isOpen) {
    return null;
  }

  function handleCheckInChange(nextCheckIn) {
    setCheckInDate(nextCheckIn);
    if (nextCheckIn && (!checkOutDate || checkOutDate <= nextCheckIn)) {
      setCheckOutDate(addDays(nextCheckIn, 1));
    }
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const parsedGuests = Number(guestsCount);
    const parsedAmount = amount.trim() === "" ? null : Number(amount);

    const input = {
      guestName,
      phoneNumber,
      roomNumber,
      checkInDate,
      checkOutDate,
      guestsCount: parsedGuests,
      amount: parsedAmount,
      notes,
    };

    const validationError = validateBookingInput(
      input,
      existingBookings,
      initialBooking?.id
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(input, initialBooking?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save booking.");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initialBooking) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCancelBooking(initialBooking.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking.");
      setSubmitting(false);
    }
  }

  const nights = countNights(checkInDate, checkOutDate);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#243B53]/50 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#243B53]/20 bg-[#F7F5F0] p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#243B53]/15 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#43A6A1]">
              {isEditing ? "Edit Reservation" : "New Reservation"}
            </p>
            <h2
              id="booking-modal-title"
              className="mt-0.5 text-xl font-semibold text-[#243B53]"
            >
              {isEditing
                ? `Room ${initialBooking.roomNumber} · ${initialBooking.guestName}`
                : `Book Room ${roomNumber}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close booking form"
            className="rounded-lg border border-[#243B53]/20 px-2.5 py-1 text-sm text-[#243B53] hover:bg-[#243B53]/10"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="guestName"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Guest Name *
              </label>
              <input
                id="guestName"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name"
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="roomNumber"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Room Number *
              </label>
              <select
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => {
                  setRoomNumber(e.target.value);
                  setError("");
                }}
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] focus:border-[#43A6A1] focus:outline-none"
              >
                {ROOM_NUMBERS.map((num) => (
                  <option key={num} value={num}>
                    Room {num}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="guestsCount"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Number of Guests *
              </label>
              <input
                id="guestsCount"
                type="number"
                min="1"
                step="1"
                required
                value={guestsCount}
                onChange={(e) => setGuestsCount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] focus:border-[#43A6A1] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="checkInDate"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Check-in Date *
              </label>
              <input
                id="checkInDate"
                type="date"
                required
                value={checkInDate}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] focus:border-[#43A6A1] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="checkOutDate"
                className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
              >
                Check-out Date *
              </label>
              <input
                id="checkOutDate"
                type="date"
                required
                min={checkInDate ? addDays(checkInDate, 1) : undefined}
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setError("");
                }}
                className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] focus:border-[#43A6A1] focus:outline-none"
              />
            </div>
          </div>

          {nights > 0 && (
            <p className="text-xs text-[#43A6A1] font-medium">
              Stay duration: {nights} {nights === 1 ? "night" : "nights"} (check-out day is available for new arrivals)
            </p>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
            >
              Amount (optional)
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 3500"
              className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-medium uppercase tracking-wide text-[#243B53]/80"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Arrival time, ID reference, or special requests"
              className="mt-1 w-full rounded-lg border border-[#243B53]/25 bg-[#F7F5F0] px-3 py-2 text-sm text-[#243B53] placeholder:text-[#243B53]/40 focus:border-[#43A6A1] focus:outline-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#243B53]/30 bg-[#243B53]/10 px-3.5 py-2.5 text-sm text-[#243B53]"
            >
              {error}
            </div>
          )}

          {isEditing && confirmingDelete ? (
            <div className="rounded-lg border border-[#243B53]/30 bg-[#243B53]/10 p-3.5">
              <p className="text-sm font-medium text-[#243B53]">
                Cancel this booking for {initialBooking.guestName}?
              </p>
              <p className="mt-1 text-xs text-[#243B53]/75">
                Room {initialBooking.roomNumber} will become available for these
                dates immediately.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="rounded-lg bg-[#243B53] px-3.5 py-2 text-xs font-medium text-[#F7F5F0] hover:bg-[#243B53]/90 disabled:opacity-50"
                >
                  {submitting ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={submitting}
                  className="rounded-lg border border-[#243B53]/25 px-3.5 py-2 text-xs font-medium text-[#243B53] hover:bg-[#243B53]/10"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#243B53]/15 pt-4">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={submitting}
                  className="rounded-lg border border-[#243B53]/30 px-3.5 py-2 text-sm font-medium text-[#243B53] hover:bg-[#243B53]/10"
                >
                  Cancel Booking
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-lg border border-[#243B53]/20 px-4 py-2 text-sm font-medium text-[#243B53] hover:bg-[#243B53]/10"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#43A6A1] px-4 py-2 text-sm font-medium text-[#F7F5F0] hover:bg-[#43A6A1]/90 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
