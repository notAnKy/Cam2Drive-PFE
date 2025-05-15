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
import PredectVideo from './pages/PredictVideo'; // Import the PredictVideo page
import PredectVideoWebcam from './pages/PredictVideoWebcam'; // Import the PredictVideoWebcam page
import DetectionHistory from './pages/DetectionHistory'; // Import the DetectionHistory page
import GenerateHeatMap from './pages/GenerateHeatMap'; // Import the GenerateHeatMap page
import PredictVideoCamera1 from './pages/PredictVideoCamera1'; // Import the PredictVideoCamera1 page




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
            <Route path="/predict-video" element={<PredectVideo />} /> 
            <Route path="/predict-video-webcam" element={<PredectVideoWebcam />} /> {/* New route for PredictVideoWebcam */}
            <Route path="/detection-history" element={<DetectionHistory />} /> {/* New route for DetectionHistory */}
            <Route path="/generate-heat-map" element={<GenerateHeatMap />} /> {/* New route for GenerateHeatMap */}
            <Route path="/predict-video-camera1" element={<PredictVideoCamera1 />} /> {/* New route for PredictVideoCamera1 */}

          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
