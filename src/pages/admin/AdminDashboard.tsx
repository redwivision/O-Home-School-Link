import { Routes, Route, Link } from 'react-router-dom';
import ManageStudents from './ManageStudents';
import ManageAttendance from './ManageAttendance';
import ManageTrips from './ManageTrips';
import AdminOverview from './AdminOverview';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<AdminOverview />} />
      <Route path="/students" element={<ManageStudents />} />
      <Route path="/attendance" element={<ManageAttendance />} />
      <Route path="/trips" element={<ManageTrips />} />
    </Routes>
  );
}
