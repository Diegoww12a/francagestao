import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import TasksSection from './components/sections/TasksSection';
import MissionsSection from './components/sections/MissionsSection';
import NotesSection from './components/sections/NotesSection';
import PurchasesSection from './components/sections/PurchasesSection';
import SalesSection from './components/sections/SalesSection';
import DeliveriesSection from './components/sections/DeliveriesSection';
import HistorySection from './components/sections/HistorySection';
import AdvancedHistoryPage from './components/pages/AdvancedHistoryPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('faction_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('faction_auth');
    setIsAuthenticated(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'tasks':
        return <TasksSection />;
      case 'missions':
        return <MissionsSection />;
      case 'notes':
        return <NotesSection />;
      case 'purchases':
        return <PurchasesSection />;
      case 'sales':
        return <SalesSection />;
      case 'deliveries':
        return <DeliveriesSection />;
      case 'history':
        return <HistorySection />;
      case 'advanced-history':
        return <AdvancedHistoryPage />;
      default:
        return <TasksSection />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`fixed lg:static inset-y-0 left-0 z-30 transform transition-transform lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar activeSection={activeSection} onSectionChange={(section) => {
          setActiveSection(section);
          setIsSidebarOpen(false);
        }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-auto bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
