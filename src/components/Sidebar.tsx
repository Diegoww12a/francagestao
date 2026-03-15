import { CheckSquare, Target, StickyNote, ShoppingCart, TrendingUp, Package, History } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare, color: 'from-blue-600 to-blue-700' },
  { id: 'missions', label: 'Missões', icon: Target, color: 'from-purple-600 to-purple-700' },
  { id: 'notes', label: 'Anotações', icon: StickyNote, color: 'from-yellow-600 to-yellow-700' },
  { id: 'purchases', label: 'Compras', icon: ShoppingCart, color: 'from-orange-600 to-orange-700' },
  { id: 'sales', label: 'Vendas', icon: TrendingUp, color: 'from-green-600 to-green-700' },
  { id: 'deliveries', label: 'Entregas', icon: Package, color: 'from-cyan-600 to-cyan-700' },
  { id: 'history', label: 'Histórico', icon: History, color: 'from-pink-600 to-pink-700' },
  { id: 'advanced-history', label: 'Relatório', icon: History, color: 'from-indigo-600 to-indigo-700' },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/50 flex flex-col">
      <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-white">França</h2>
        </div>
        <p className="text-xs text-gray-400 ml-4">Painel de Controle</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-current/30`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-current/20 to-transparent rounded-lg blur"></div>
              )}
              <Icon size={20} className="relative z-10" />
              <span className="font-medium relative z-10">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full relative z-10"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/50 bg-gray-900/50">
        <p className="text-xs text-gray-500 text-center">v1.0 • Gestão da França</p>
      </div>
    </aside>
  );
}
