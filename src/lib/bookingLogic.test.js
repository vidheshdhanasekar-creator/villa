import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  countNights,
  doDateRangesOverlap,
  findOverlappingBooking,
  getCalendarGridDays,
  getDashboardSummary,
  getRoomAvailabilityForDate,
  isRoomBookedOnDate,
  isValidDateKey,
  validateBookingInput,
} from "./bookingLogic.js";

function makeBooking(overrides = {}) {
  return {
    id: "booking-1",
    guestName: "Aarav Mehta",
    phoneNumber: "+91 9876543210",
    roomNumber: "101",
    checkInDate: "2026-12-26",
    checkOutDate: "2026-12-27",
    guestsCount: 2,
    amount: 3500,
    notes: "",
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

test("isRoomBookedOnDate treats check-in as inclusive and check-out as exclusive", () => {
  const booking = makeBooking({
    roomNumber: "101",
    checkInDate: "2026-12-26",
    checkOutDate: "2026-12-27",
  });

  assert.equal(isRoomBookedOnDate(booking, "2026-12-25"), false);
  assert.equal(isRoomBookedOnDate(booking, "2026-12-26"), true);
  assert.equal(isRoomBookedOnDate(booking, "2026-12-27"), false);
});

test("doDateRangesOverlap allows back-to-back check-out and check-in on same day", () => {
  assert.equal(
    doDateRangesOverlap("2026-12-26", "2026-12-27", "2026-12-27", "2026-12-29"),
    false
  );
  assert.equal(
    doDateRangesOverlap("2026-12-26", "2026-12-28", "2026-12-27", "2026-12-29"),
    true
  );
  assert.equal(
    doDateRangesOverlap("2026-12-25", "2026-12-30", "2026-12-26", "2026-12-28"),
    true
  );
});

test("findOverlappingBooking ignores excluded booking id and other rooms", () => {
  const existing = [
    makeBooking({
      id: "b1",
      roomNumber: "101",
      checkInDate: "2026-12-26",
      checkOutDate: "2026-12-28",
    }),
    makeBooking({
      id: "b2",
      roomNumber: "102",
      checkInDate: "2026-12-26",
      checkOutDate: "2026-12-28",
    }),
  ];

  assert.equal(
    findOverlappingBooking(
      existing,
      { roomNumber: "101", checkInDate: "2026-12-26", checkOutDate: "2026-12-29" },
      "b1"
    ),
    undefined
  );

  assert.equal(
    findOverlappingBooking(existing, {
      roomNumber: "103",
      checkInDate: "2026-12-26",
      checkOutDate: "2026-12-28",
    }),
    undefined
  );

  assert.equal(
    findOverlappingBooking(existing, {
      roomNumber: "101",
      checkInDate: "2026-12-27",
      checkOutDate: "2026-12-29",
    })?.id,
    "b1"
  );
});

test("validateBookingInput rejects invalid ranges and overlapping bookings", () => {
  const existing = [
    makeBooking({
      id: "b1",
      guestName: "Priya Sharma",
      roomNumber: "104",
      checkInDate: "2026-12-20",
      checkOutDate: "2026-12-23",
    }),
  ];

  const baseInput = {
    guestName: "Rohan Verma",
    phoneNumber: "9988776655",
    roomNumber: "104",
    checkInDate: "2026-12-23",
    checkOutDate: "2026-12-25",
    guestsCount: 2,
    amount: null,
    notes: "",
  };

  assert.equal(validateBookingInput(baseInput, existing), null);

  const overlapError = validateBookingInput(
    { ...baseInput, checkInDate: "2026-12-22" },
    existing
  );
  assert.match(overlapError ?? "", /Room 104 is already booked by Priya Sharma/);

  assert.equal(
    validateBookingInput(
      { ...baseInput, checkInDate: "2026-12-24", checkOutDate: "2026-12-24" },
      existing
    ),
    "Check-out date must be after check-in date."
  );
});

test("getRoomAvailabilityForDate and getDashboardSummary compute accurate counts", () => {
  const bookings = [
    makeBooking({
      id: "b1",
      roomNumber: "101",
      checkInDate: "2026-11-25",
      checkOutDate: "2026-11-27",
    }),
    makeBooking({
      id: "b2",
      roomNumber: "105",
      checkInDate: "2026-11-23",
      checkOutDate: "2026-11-25",
    }),
    makeBooking({
      id: "b3",
      roomNumber: "107",
      checkInDate: "2026-11-24",
      checkOutDate: "2026-11-26",
    }),
  ];

  const availability = getRoomAvailabilityForDate(bookings, "2026-11-25");
  assert.equal(availability.length, 7);
  assert.equal(availability.find((r) => r.roomNumber === "101")?.booking?.id, "b1");
  assert.equal(availability.find((r) => r.roomNumber === "105")?.booking, null);
  assert.equal(availability.find((r) => r.roomNumber === "107")?.booking?.id, "b3");

  const summary = getDashboardSummary(bookings, "2026-11-25", "2026-11-25");
  assert.equal(summary.totalRooms, 7);
  assert.equal(summary.bookedCount, 2);
  assert.equal(summary.availableCount, 5);
  assert.deepEqual(
    summary.todaysCheckIns.map((b) => b.id),
    ["b1"]
  );
  assert.deepEqual(
    summary.todaysCheckOuts.map((b) => b.id),
    ["b2"]
  );
});

test("calendar helpers handle leap years, month grids, and day math", () => {
  assert.equal(isValidDateKey("2026-02-29"), false);
  assert.equal(isValidDateKey("2024-02-29"), true);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(countNights("2026-12-26", "2026-12-27"), 1);

  const dec2026 = getCalendarGridDays(2026, 11);
  assert.equal(dec2026.length % 7, 0);
  assert.equal(dec2026.filter((c) => c.inCurrentMonth).length, 31);
});
