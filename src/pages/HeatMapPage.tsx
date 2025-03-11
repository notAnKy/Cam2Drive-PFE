import { useState } from 'react';
import Sidebar from '../layouts/Sidebar';

function App() {
  
  const [sidebarWidth, setSidebarWidth] = useState("16rem");

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar setSidebarWidth={setSidebarWidth} />
      <main className="flex-1 p-8" style={{ marginLeft: sidebarWidth }}>
        <div className="flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-indigo-700">heat map page</h1>
        </div>
      </main>
    </div>
  );
}

export default App;
