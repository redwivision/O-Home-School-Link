# O-Home School Link

A school transportation safety platform for monitoring student attendance and trip status.

## Getting Started

1. **Firebase Setup**:
   - The app uses Firebase for data and auth.
   - Admin access is bootstrapped for `lewikb13@gmail.com`.
   - Security rules are pre-configured in `firestore.rules`.

2. **Environment Variables**:
   - `GEMINI_API_KEY`: Required for some AI features (though currently not used per request).
   - `VITE_FIREBASE_CONFIG`: Handled by `firebase-applet-config.json` in this environment.

3. **Running the app**:
   ```bash
   npm install
   npm run dev
   ```

4. **Roles and Access**:
   - **Admin**: Full control over users, attendance, and logs.
   - **Parent**: Can see their child's attendance and real-time bus location.
   - **Student**: Can see their own profile, attendance history, and bus status.
   - **Driver**: Can start/end trips and update vehicle location.

## Project Structure

- `src/contexts/AuthContext.tsx`: Manages user sessions and profiles.
- `src/pages/admin/`: Admin-specific management views.
- `src/pages/driver/`: Trip management for drivers.
- `src/pages/parent/` & `src/pages/student/`: Monitoring views.
- `src/components/ui/`: shadcn/ui shared components.

## MVP Features

- ✅ Authentication with Google.
- ✅ Role-based routing and dashboards.
- ✅ Student & Personnel management.
- ✅ Attendance tracking.
- ✅ Real-time Trip status updates (Manual location updates).
- ✅ Clean, responsive dashboard UI.
