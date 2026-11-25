import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ROOM_NUMBERS, validateBookingInput } from "./bookingLogic.js";
import { getFirebaseDb } from "./firebase.js";

const BOOKINGS_COLLECTION = "bookings";

function toBooking(id, data) {
  const roomCandidate = String(data.roomNumber ?? "101");
  const roomNumber = ROOM_NUMBERS.includes(roomCandidate) ? roomCandidate : "101";

  return {
    id,
    guestName: String(data.guestName ?? ""),
    phoneNumber: String(data.phoneNumber ?? ""),
    roomNumber,
    checkInDate: String(data.checkInDate ?? ""),
    checkOutDate: String(data.checkOutDate ?? ""),
    guestsCount: Number(data.guestsCount ?? 1),
    amount:
      data.amount === null || data.amount === undefined || data.amount === ""
        ? null
        : Number(data.amount),
    notes: String(data.notes ?? ""),
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0),
  };
}

function normalizeBookingInput(input) {
  return {
    guestName: input.guestName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    roomNumber: input.roomNumber,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    guestsCount: input.guestsCount,
    amount: input.amount,
    notes: (input.notes ?? "").trim(),
  };
}

/**
 * Subscribes to all residency bookings ordered by check-in date.
 */
export function subscribeBookings(onData, onError) {
  const db = getFirebaseDb();
  const bookingsQuery = query(
    collection(db, BOOKINGS_COLLECTION),
    orderBy("checkInDate", "asc")
  );

  return onSnapshot(
    bookingsQuery,
    (snapshot) => {
      const bookings = snapshot.docs.map((docSnap) =>
        toBooking(docSnap.id, docSnap.data())
      );
      onData(bookings);
    },
    (error) => {
      onError(error);
    }
  );
}

async function fetchRoomBookings(roomNumber) {
  const db = getFirebaseDb();
  const roomQuery = query(
    collection(db, BOOKINGS_COLLECTION),
    where("roomNumber", "==", roomNumber)
  );
  const snapshot = await getDocs(roomQuery);
  return snapshot.docs.map((docSnap) => toBooking(docSnap.id, docSnap.data()));
}

/**
 * Creates a new booking after verifying against latest Firestore room data to prevent overlaps.
 */
export async function createBooking(input) {
  const latestRoomBookings = await fetchRoomBookings(input.roomNumber);
  const validationError = validateBookingInput(input, latestRoomBookings);
  if (validationError) {
    throw new Error(validationError);
  }

  const db = getFirebaseDb();
  const now = Date.now();
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...normalizeBookingInput(input),
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing booking after verifying no overlap exists for the target room and dates.
 */
export async function updateBooking(bookingId, input) {
  const latestRoomBookings = await fetchRoomBookings(input.roomNumber);
  const validationError = validateBookingInput(
    input,
    latestRoomBookings,
    bookingId
  );
  if (validationError) {
    throw new Error(validationError);
  }

  const db = getFirebaseDb();
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    ...normalizeBookingInput(input),
    updatedAt: Date.now(),
  });
}

/**
 * Cancels (deletes) a booking permanently from Firestore.
 */
export async function cancelBooking(bookingId) {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
}
