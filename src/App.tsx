// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import LicensePlatesPage from './pages/LicensePlatesPages/LicensePlates';
import DailySummaryPage from './pages/DailySummaryPage';
import PeopleCountingDashboard from './pages/PeopleCountingDashboard';
import HeatMapPage from './pages/HeatMapPage';
import Home from './pages/home';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './pages/ResetPassword'; // Import the ResetPassword page

function App() {
  return (
    <div>
      <main>
        {/* Define the routes */}
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Reset Password Route */}
          <Route path="/reset-password" element={<ResetPassword />} /> {/* New route for ResetPassword */}


          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/license-plates" element={<LicensePlatesPage />} />
            <Route path="/daily-summary" element={<DailySummaryPage />} />
            <Route path="/people-counting" element={<PeopleCountingDashboard />} />
            <Route path="/heat-map" element={<HeatMapPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
