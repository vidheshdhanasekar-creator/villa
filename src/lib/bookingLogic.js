export const ROOM_NUMBERS = ["101", "102", "103", "104", "105", "106", "107"];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats a local Date instance as a YYYY-MM-DD calendar key.
 */
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD calendar key into a local Date at midnight.
 */
export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Validates that a string is a real YYYY-MM-DD calendar date.
 */
export function isValidDateKey(value) {
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/**
 * Adds a whole number of days to a YYYY-MM-DD calendar key.
 */
export function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

/**
 * Formats a YYYY-MM-DD key for human display (e.g., "Dec 26, 2026").
 */
export function formatDisplayDate(dateKey) {
  if (!isValidDateKey(dateKey)) {
    return dateKey;
  }
  return parseDateKey(dateKey).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a year and zero-based month index for calendar headers.
 */
export function formatMonthYear(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Counts nights for a [checkInDate, checkOutDate) interval.
 */
export function countNights(checkInDate, checkOutDate) {
  if (!isValidDateKey(checkInDate) || !isValidDateKey(checkOutDate)) {
    return 0;
  }
  const start = parseDateKey(checkInDate);
  const end = parseDateKey(checkOutDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / 86_400_000));
}

/**
 * A room is booked from check-in date (inclusive) up to check-out date (exclusive).
 */
export function isRoomBookedOnDate(booking, dateKey) {
  return booking.checkInDate <= dateKey && dateKey < booking.checkOutDate;
}

/**
 * Two half-open stays [checkIn, checkOut) overlap iff a.in < b.out && b.in < a.out.
 */
export function doDateRangesOverlap(aCheckIn, aCheckOut, bCheckIn, bCheckOut) {
  return aCheckIn < bCheckOut && bCheckIn < aCheckOut;
}

/**
 * Finds the first existing booking for the same room that overlaps the candidate range.
 */
export function findOverlappingBooking(
  bookings,
  candidate,
  excludeBookingId = undefined
) {
  return bookings.find((existing) => {
    if (excludeBookingId && existing.id === excludeBookingId) {
      return false;
    }
    if (existing.roomNumber !== candidate.roomNumber) {
      return false;
    }
    return doDateRangesOverlap(
      candidate.checkInDate,
      candidate.checkOutDate,
      existing.checkInDate,
      existing.checkOutDate
    );
  });
}

/**
 * Validates booking form fields and ensures no overlapping reservation exists.
 * Returns null if valid, or a user-facing error message.
 */
export function validateBookingInput(
  input,
  existingBookings,
  excludeBookingId = undefined
) {
  if (!input.guestName || !input.guestName.trim()) {
    return "Guest name is required.";
  }
  if (!input.phoneNumber || !input.phoneNumber.trim()) {
    return "Phone number is required.";
  }
  if (!ROOM_NUMBERS.includes(input.roomNumber)) {
    return "Please select a valid room (101–107).";
  }
  if (!isValidDateKey(input.checkInDate)) {
    return "Please enter a valid check-in date.";
  }
  if (!isValidDateKey(input.checkOutDate)) {
    return "Please enter a valid check-out date.";
  }
  if (input.checkOutDate <= input.checkInDate) {
    return "Check-out date must be after check-in date.";
  }
  if (!Number.isInteger(input.guestsCount) || input.guestsCount < 1) {
    return "Number of guests must be at least 1.";
  }
  if (
    input.amount !== null &&
    input.amount !== undefined &&
    (!Number.isFinite(input.amount) || input.amount < 0)
  ) {
    return "Amount must be zero or a positive number.";
  }

  const conflict = findOverlappingBooking(
    existingBookings,
    {
      roomNumber: input.roomNumber,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
    },
    excludeBookingId
  );

  if (conflict) {
    return `Room ${input.roomNumber} is already booked by ${conflict.guestName} from ${formatDisplayDate(
      conflict.checkInDate
    )} to ${formatDisplayDate(conflict.checkOutDate)}.`;
  }

  return null;
}

/**
 * Maps all 7 rooms (101–107) to their booking status on a given calendar date.
 */
export function getRoomAvailabilityForDate(bookings, dateKey) {
  const byRoom = new Map();
  for (const booking of bookings) {
    if (isRoomBookedOnDate(booking, dateKey) && !byRoom.has(booking.roomNumber)) {
      byRoom.set(booking.roomNumber, booking);
    }
  }

  return ROOM_NUMBERS.map((roomNumber) => ({
    roomNumber,
    booking: byRoom.get(roomNumber) ?? null,
  }));
}

/**
 * Computes dashboard metrics for the selected date and today's check-ins/check-outs.
 */
export function getDashboardSummary(bookings, selectedDateKey, todayKey) {
  const roomStatuses = getRoomAvailabilityForDate(bookings, selectedDateKey);
  const bookedCount = roomStatuses.filter((item) => item.booking !== null).length;

  const todaysCheckIns = bookings
    .filter((booking) => booking.checkInDate === todayKey)
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

  const todaysCheckOuts = bookings
    .filter((booking) => booking.checkOutDate === todayKey)
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

  return {
    totalRooms: ROOM_NUMBERS.length,
    availableCount: ROOM_NUMBERS.length - bookedCount,
    bookedCount,
    todaysCheckIns,
    todaysCheckOuts,
  };
}

/**
 * Generates Sunday-first calendar cells covering the requested month.
 */
export function getCalendarGridDays(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(year, monthIndex, 1 - startOffset + i);
    cells.push({
      dateKey: formatDateKey(cellDate),
      dayOfMonth: cellDate.getDate(),
      inCurrentMonth:
        cellDate.getFullYear() === year && cellDate.getMonth() === monthIndex,
    });
  }
  return cells;
}
