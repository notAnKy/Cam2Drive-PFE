import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart2, Car, Users, Map, LogOut,ScanFace,ScanLine,History,Activity,Flame } from "lucide-react";

// Define the type for props
interface SidebarProps {
  setSidebarWidth: (width: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setSidebarWidth }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    () => JSON.parse(localStorage.getItem("sidebarExpanded") || "true")
  );

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if the user is logged in by looking for the token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      navigate("/login"); // Redirect to login if not logged in
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded));
    setSidebarWidth(isExpanded ? "16rem" : "5rem"); // Adjust width based on sidebar state
  }, [isExpanded, setSidebarWidth]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Collapse sidebar automatically on mobile
      if (window.innerWidth < 768) {
        setIsExpanded(false);
        setSidebarWidth("5rem");
      } else {
        setIsExpanded(true);
        setSidebarWidth("16rem");
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setSidebarWidth]);

  const menuItems = [
    { name: "Cam2Drive", icon: Home, path: "/" },
    { name: "Daily Summary", icon: BarChart2, path: "/daily-summary" },
    { name: "License Plates", icon: Car, path: "/license-plates" },
    { name: "People Counting", icon: Users, path: "/people-counting" },
    { name: "Generate Heat Map", icon: Activity, path: "/generate-heat-map" },
    { name: "Heat Map", icon: Map, path: "/heat-map" },
    { name: "Predict Video", icon: ScanLine, path: "/predict-video" },
    { name: "Predict Video Webcam", icon: ScanFace, path: "/predict-video-webcam" },
    { name: "Predict Video Camera 1", icon: ScanFace, path: "/predict-video-camera1" },
    { name: "Detection History", icon: History, path: "/detection-history" },
    
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  // If user is not logged in, return null or redirect to login page
  if (!isLoggedIn) {
    return null; // Or use <Navigate to="/login" /> to redirect immediately
  }

  return (
    <div
      className={`fixed top-0 left-0 bottom-0 h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 text-white p-4 flex flex-col ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 bg-indigo-600 rounded-full p-1.5 hover:bg-indigo-700 transition-colors"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {isExpanded ? "←" : "→"}
        </div>
      </button>

      <div className="space-y-4 mt-8">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
              isActiveRoute(item.path)
                ? "bg-indigo-600 text-white shadow-lg"
                : "hover:bg-indigo-600 hover:bg-opacity-10"
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActiveRoute(item.path) ? "text-white" : ""}`} />
            {isExpanded && (
              <span className={`ml-3 whitespace-nowrap font-medium ${isActiveRoute(item.path) ? "text-white" : ""}`}>
                {item.name}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={async () => {
          try {
            const response = await fetch("http://localhost:5000/api/users/logout", {
              method: "POST",
              credentials: "include", // Important if you're using cookies for sessions
            });

            if (response.ok) {
              // Clear any stored user data (session/local storage)
              localStorage.removeItem("token"); // Remove the token from localStorage

              // Redirect to the login page
              navigate("/login");
            } else {
              console.error("Logout failed");
            }
          } catch (error) {
            console.error("Error logging out:", error);
          }
        }}
        className="mt-auto w-full flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
      >
        <LogOut className="w-6 h-6 text-red-400" />
        {isExpanded && (
          <span className="ml-3 whitespace-nowrap font-medium text-red-400">
            Exit
          </span>
        )}
      </button>
    </div>
  );
};

export default Sidebar;
