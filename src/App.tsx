import { Route, Routes } from 'react-router-dom';
import LicensePlatesPage from './pages/LicensePlatesPages/LicensePlates';
import DailySummaryPage from './pages/DailySummaryPage';
import PeopleCountingDashboard from './pages/PeopleCountingDashboard';
import HeatMapPage from './pages/HeatMapPage';
import Home from './pages/home';  // Import the Home page

function App() {
  return (
    <div >
      <main >
        {/* Define the routes */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* Make this the homepage */}
          <Route path="/license-plates" element={<LicensePlatesPage />} />
          <Route path="/daily-summary" element={<DailySummaryPage />} />
          <Route path="/people-counting" element={<PeopleCountingDashboard />} />
          <Route path="/heat-map" element={<HeatMapPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
