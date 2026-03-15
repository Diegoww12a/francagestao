import { useState, useEffect } from 'react';
import { Search, Download, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

interface HistoryRecord { id: string; type: string; title: string; description?: string; amount?: number; status: string; date: string; }

const fmtBR = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

export default function AdvancedHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchAllRecords(); }, []);
  useEffect(() => { filterRecords(); }, [records, searchTerm, typeFilter, dateRange]);

  const fetchAllRecords = async () => {
    setIsLoading(true);
    const [tasks, missions, purchases, sales, deliveries] = await Promise.all([
      api.getTasks(), api.getMissions(), api.getPurchases(), api.getSales(), api.getDeliveries()
    ]);
    const all: HistoryRecord[] = [
      ...tasks.filter((t: any) => t.status === 'completed').map((t: any) => ({ id: t.id, type: 'task', title: `Tarefa: ${t.title}`, description: t.description, status: t.status, date: t.completed_at || t.created_at })),
      ...missions.filter((m: any) => m.status === 'completed').map((m: any) => ({ id: m.id, type: 'mission', title: `Missão: ${m.title}`, description: m.description, status: m.status, date: m.completed_at || m.created_at })),
      ...purchases.filter((p: any) => p.status === 'completed').map((p: any) => ({ id: p.id, type: 'purchase', title: `Compra: ${p.item}`, description: `${fmtBR(p.quantity)}x - R$ ${fmtBR(p.price)}`, amount: p.price * p.quantity, status: p.status, date: p.created_at })),
      ...sales.map((s: any) => ({ id: s.id, type: 'sale', title: `Venda: ${s.item}`, description: `${fmtBR(s.quantity)}x - ${s.buyer || 'Sem comprador'}`, amount: s.price * s.quantity, status: 'completed', date: s.created_at })),
      ...deliveries.filter((d: any) => d.status === 'completed').map((d: any) => ({ id: d.id, type: 'delivery', title: `Entrega: ${d.recipient}`, description: d.description, status: d.status, date: d.completed_at || d.created_at })),
    ];
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(all);
    setIsLoading(false);
  };

  const filterRecords = () => {
    let filtered = records;
    if (searchTerm) filtered = filtered.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (typeFilter !== 'all') filtered = filtered.filter(r => r.type === typeFilter);
    if (dateRange !== 'all') {
      const now = new Date();
      const from = new Date();
      if (dateRange === 'today') from.setHours(0, 0, 0, 0);
      else if (dateRange === 'week') from.setDate(now.getDate() - 7);
      else if (dateRange === 'month') from.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.date) >= from);
    }
    setFilteredRecords(filtered);
  };

  const typeLabels: Record<string, string> = { task: '📋 Tarefa', mission: '🎯 Missão', purchase: '🛒 Compra', sale: '💰 Venda', delivery: '📦 Entrega' };
  const typeColors: Record<string, string> = { task: 'bg-blue-500/20 text-blue-400', mission: 'bg-purple-500/20 text-purple-400', purchase: 'bg-yellow-500/20 text-yellow-400', sale: 'bg-green-500/20 text-green-400', delivery: 'bg-orange-500/20 text-orange-400' };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const totalSales = filteredRecords.filter(r => r.type === 'sale').reduce((s, r) => s + (r.amount || 0), 0);
  const totalPurchases = filteredRecords.filter(r => r.type === 'purchase').reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Histórico Detalhado</h2><p className="text-gray-400 mt-1">Análise completa de todas as atividades</p></div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Download size={18} /> Exportar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white"><div className="flex items-center justify-between mb-2"><p className="text-green-100 text-sm">Total em Vendas</p><TrendingUp size={24} className="text-green-200" /></div><p className="text-3xl font-bold">R$ {fmtBR(totalSales)}</p></div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white"><p className="text-red-100 text-sm mb-2">Total em Compras</p><p className="text-3xl font-bold">R$ {fmtBR(totalPurchases)}</p></div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white"><p className="text-blue-100 text-sm mb-2">Total de Registros</p><p className="text-3xl font-bold">{filteredRecords.length}</p></div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" placeholder="Buscar registros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" /></div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"><option value="all">Todos os Tipos</option><option value="task">Tarefas</option><option value="mission">Missões</option><option value="purchase">Compras</option><option value="sale">Vendas</option><option value="delivery">Entregas</option></select>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"><option value="all">Todos os Períodos</option><option value="today">Hoje</option><option value="week">Última Semana</option><option value="month">Último Mês</option></select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/80 sticky top-0"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipo</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Título</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Detalhes</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Valor</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th></tr></thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={`${record.type}-${record.id}`}>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs ${typeColors[record.type]}`}>{typeLabels[record.type]}</span></td>
                  <td className="px-6 py-4 text-white">{record.title}</td>
                  <td className="px-6 py-4 text-gray-400">{record.description}</td>
                  <td className="px-6 py-4 text-right text-white">{record.amount ? `R$ ${fmtBR(record.amount)}` : '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum registro encontrado</p></div>}
        </div>
      )}
    </div>
  );
}
