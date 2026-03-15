import { Menu, X, LogOut } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onLogout?: () => void;
}

export default function Header({ onToggleSidebar, isSidebarOpen, onLogout }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-6 py-4 backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">França Dashboard</h1>
            <p className="text-sm text-gray-400 capitalize">{dateStr}</p>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 hover:text-red-300 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm font-medium">Sair</span>
          </button>
        )}
      </div>
    </header>
  );
}
