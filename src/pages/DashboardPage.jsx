import { useEffect, useMemo, useState } from "react";
import BookingModal from "../components/BookingModal.jsx";
import DashboardSummary from "../components/DashboardSummary.jsx";
import MonthlyCalendar from "../components/MonthlyCalendar.jsx";
import RoomGrid from "../components/RoomGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  formatDateKey,
  getDashboardSummary,
  getRoomAvailabilityForDate,
  parseDateKey,
} from "../lib/bookingLogic.js";
import {
  cancelBooking,
  createBooking,
  subscribeBookings,
  updateBooking,
} from "../lib/bookingsService.js";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const todayKey = formatDateKey(new Date());

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    initialBooking: null,
    defaultRoomNumber: "101",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeBookings(
      (nextBookings) => {
        setBookings(nextBookings);
        setLoadingBookings(false);
        setLoadError("");
      },
      (err) => {
        const baseMsg =
          err?.message ||
          "Unable to load bookings. Check Firestore rules and connection.";
        const isPermissionError =
          err?.code === "permission-denied" ||
          baseMsg.toLowerCase().includes("permission");
        setLoadError(
          isPermissionError
            ? `${baseMsg} (Signed in as: ${user.email || "unknown"} — verify this exact email is allowed in Firebase Console → Firestore Database → Rules and click Publish.)`
            : baseMsg
        );
        setLoadingBookings(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const summary = useMemo(
    () => getDashboardSummary(bookings, selectedDateKey, todayKey),
    [bookings, selectedDateKey, todayKey]
  );

  const roomStatuses = useMemo(
    () => getRoomAvailabilityForDate(bookings, selectedDateKey),
    [bookings, selectedDateKey]
  );

  function handleSelectDate(dateKey) {
    setSelectedDateKey(dateKey);
    const parsed = parseDateKey(dateKey);
    if (
      parsed.getFullYear() !== calendarMonth.year ||
      parsed.getMonth() !== calendarMonth.monthIndex
    ) {
      setCalendarMonth({
        year: parsed.getFullYear(),
        monthIndex: parsed.getMonth(),
      });
    }
  }

  function handlePrevMonth() {
    setCalendarMonth((prev) =>
      prev.monthIndex === 0
        ? { year: prev.year - 1, monthIndex: 11 }
        : { year: prev.year, monthIndex: prev.monthIndex - 1 }
    );
  }

  function handleNextMonth() {
    setCalendarMonth((prev) =>
      prev.monthIndex === 11
        ? { year: prev.year + 1, monthIndex: 0 }
        : { year: prev.year, monthIndex: prev.monthIndex + 1 }
    );
  }

  function handleGoToToday() {
    const now = new Date();
    const today = formatDateKey(now);
    setSelectedDateKey(today);
    setCalendarMonth({ year: now.getFullYear(), monthIndex: now.getMonth() });
  }

  function openNewBookingModal(roomNumber = "101") {
    setModalState({
      isOpen: true,
      initialBooking: null,
      defaultRoomNumber: roomNumber,
    });
  }

  function openEditBookingModal(booking) {
    setModalState({
      isOpen: true,
      initialBooking: booking,
      defaultRoomNumber: booking.roomNumber,
    });
  }

  function closeModal() {
    setModalState((prev) => ({ ...prev, isOpen: false, initialBooking: null }));
  }

  async function handleSaveBooking(input, existingId) {
    if (existingId) {
      await updateBooking(existingId, input);
    } else {
      await createBooking(input);
    }
  }

  async function handleCancelBooking(bookingId) {
    await cancelBooking(bookingId);
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#243B53]">
      <header className="border-b border-[#243B53]/15 bg-[#F7F5F0]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#43A6A1]">
              Admin Dashboard
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-[#243B53]">
              Villa Residency
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const firstAvailable = roomStatuses.find((r) => !r.booking);
                openNewBookingModal(firstAvailable?.roomNumber ?? "101");
              }}
              className="rounded-lg bg-[#43A6A1] px-4 py-2 text-sm font-medium text-[#F7F5F0] hover:bg-[#43A6A1]/90"
            >
              + New Booking
            </button>

            <span className="hidden text-xs text-[#243B53]/70 sm:inline">
              {user?.email}
            </span>

            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg border border-[#243B53]/25 px-3.5 py-2 text-sm font-medium text-[#243B53] hover:bg-[#243B53]/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-[#243B53]/30 bg-[#243B53]/10 p-4 text-sm text-[#243B53]"
          >
            {loadError}
          </div>
        )}

        <DashboardSummary
          summary={summary}
          selectedDateKey={selectedDateKey}
          onSelectBooking={openEditBookingModal}
        />

        {loadingBookings ? (
          <div className="rounded-xl border border-[#243B53]/15 bg-[#F7F5F0] p-10 text-center text-sm text-[#243B53]/70">
            Loading residency bookings...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <MonthlyCalendar
                year={calendarMonth.year}
                monthIndex={calendarMonth.monthIndex}
                selectedDateKey={selectedDateKey}
                todayKey={todayKey}
                bookings={bookings}
                onSelectDate={handleSelectDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onGoToToday={handleGoToToday}
              />
            </div>

            <div className="lg:col-span-5">
              <RoomGrid
                selectedDateKey={selectedDateKey}
                roomStatuses={roomStatuses}
                onSelectAvailableRoom={openNewBookingModal}
                onSelectBookedRoom={openEditBookingModal}
              />
            </div>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={modalState.isOpen}
        initialBooking={modalState.initialBooking}
        defaultRoomNumber={modalState.defaultRoomNumber}
        defaultCheckInDate={selectedDateKey}
        existingBookings={bookings}
        onSave={handleSaveBooking}
        onCancelBooking={handleCancelBooking}
        onClose={closeModal}
      />
    </div>
  );
}
