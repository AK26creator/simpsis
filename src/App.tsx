import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/Layout/AdminLayout';
import EmployeeLayout from './components/Layout/EmployeeLayout';

import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import UserList from './pages/Users/UserList';
import CreateUser from './pages/Users/CreateUser';
import AdminProfile from './pages/Admin/AdminProfile';
import Announcements from './pages/Admin/Announcements';
import LeaveManagement from './pages/Admin/LeaveManagement';

import EmployeeDashboard from './pages/Employee/Dashboard';
import DepartmentFeed from './pages/Employee/DepartmentFeed';
import SubmitReport from './pages/Employee/SubmitReport';
import ApplyLeave from './pages/Employee/ApplyLeave';
import WorkHistory from './pages/Employee/WorkHistory';
import Profile from './pages/Employee/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>

          <Route path="/app" element={<EmployeeLayout />}>
            <Route index element={<DepartmentFeed />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="submit" element={<SubmitReport />} />
            <Route path="leave" element={<ApplyLeave />} />
            <Route path="history" element={<WorkHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
