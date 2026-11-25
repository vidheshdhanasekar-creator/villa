# Villa Residency — Room Booking Web App

A lightweight, calendar-based room booking manager for 7 rooms (`101`–`107`) built with React (Vite), Tailwind CSS, Firebase Authentication, and Cloud Firestore.

## Features

- **Single-Admin Authentication**: Username/password login backed by Firebase Email/Password Authentication. All routes and Firestore data are protected.
- **Monthly Calendar**: Navigate months, jump to Today, and click any date to view availability for all 7 rooms.
- **Half-Open Booking Logic**: A room is booked from check-in date (inclusive) up to, excluding, check-out date (`Dec 26` to `Dec 27` -> `Dec 26` Booked, `Dec 27` Available). Prevents overlapping bookings on the same room.
- **Booking Management**: Create, edit, and cancel bookings with guest name, phone, room (`101`–`107`), check-in/out dates, guest count, optional amount, and optional notes.
- **Dashboard Summary**: Total rooms (`7`), available/booked counts for the selected date, and today's check-ins and check-outs.

---

## Firebase Setup Instructions

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Register a **Web App** inside the project to get your Firebase config values.

### 2. Enable Authentication (Single Admin User)
1. Open **Build → Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Open **Authentication → Users → Add user** and create your single admin account:
   - Recommended email: `admin@residency.local` (lets you sign in with username `admin` out of the box).
   - Or use any email of your choice and set `VITE_ADMIN_EMAIL` in `.env` (and update `firestore.rules` to match).

### 3. Enable Cloud Firestore & Deploy Security Rules
1. Open **Build → Firestore Database → Create database** (Production mode).
2. Publish the rules from [`firestore.rules`](./firestore.rules) either in the **Firestore → Rules** tab in the Firebase Console or via Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```
   > **Note**: If your admin user's email is not `admin@residency.local`, update the `isAdmin()` email check in `firestore.rules` to match your admin email.

### 4. Configure Local Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase Web App credentials:

```bash
cp .env.example .env
```

Variables in `.env`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_USERNAME` (default: `admin`)
- `VITE_ADMIN_EMAIL` (optional override; if set, enforces this exact admin email)
- `VITE_ADMIN_EMAIL_DOMAIN` (default: `residency.local`)

---

## Local Development & Verification

```bash
npm install
npm run test     # Run booking & calendar unit tests
npm run dev      # Start Vite dev server
npm run build    # Build production bundle in dist/
```

---

## Vercel Deployment

1. Push this repository to GitHub/GitLab/Bitbucket (ensure `.env` is not committed; it is ignored in `.gitignore`).
2. Import the project in [Vercel](https://vercel.com/) — Framework Preset: **Vite**.
3. Add all environment variables from `.env.example` under **Project Settings → Environment Variables**.
4. Deploy. `vercel.json` is already configured with SPA rewrites so refreshing `/login` or `/` works seamlessly.
5. In **Firebase Console → Authentication → Settings → Authorized domains**, add your deployed Vercel domain (e.g., `your-app.vercel.app`).
