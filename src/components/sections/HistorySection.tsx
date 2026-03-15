import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { api } from '../../lib/api';

interface HistoryItem { id: string; type: 'task' | 'mission' | 'purchase' | 'delivery'; title: string; description?: string; completed_at: string; }

const fmtBR = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

export default function HistorySection() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'task' | 'mission' | 'purchase' | 'delivery'>('all');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const [tasks, missions, purchases, deliveries] = await Promise.all([
      api.getTasks(), api.getMissions(), api.getPurchases(), api.getDeliveries()
    ]);
    const items: HistoryItem[] = [
      ...tasks.filter((t: any) => t.status === 'completed' && t.completed_at).map((t: any) => ({ id: t.id, type: 'task' as const, title: t.title, description: t.description, completed_at: t.completed_at })),
      ...missions.filter((m: any) => m.status === 'completed' && m.completed_at).map((m: any) => ({ id: m.id, type: 'mission' as const, title: m.title, description: m.description, completed_at: m.completed_at })),
      ...purchases.filter((p: any) => p.status === 'completed').map((p: any) => ({ id: p.id, type: 'purchase' as const, title: `${p.item} (${fmtBR(p.quantity)}x)`, description: `R$ ${fmtBR(p.price * p.quantity)}`, completed_at: p.created_at })),
      ...deliveries.filter((d: any) => d.status === 'completed' && d.completed_at).map((d: any) => ({ id: d.id, type: 'delivery' as const, title: `Entrega para ${d.recipient}`, description: d.description, completed_at: d.completed_at })),
    ];
    items.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    setHistory(items);
  };

  const filteredHistory = filter === 'all' ? history : history.filter(i => i.type === filter);

  const typeLabels = { task: 'Tarefa', mission: 'Missão', purchase: 'Compra', delivery: 'Entrega' };
  const typeColors = { task: 'bg-blue-500/20 text-blue-400 border-blue-500/30', mission: 'bg-purple-500/20 text-purple-400 border-purple-500/30', purchase: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', delivery: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const groupByDate = (items: HistoryItem[]) => {
    const groups: { [k: string]: HistoryItem[] } = {};
    items.forEach(item => {
      const date = new Date(item.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(filteredHistory);
  const filters: Array<typeof filter> = ['all', 'task', 'mission', 'purchase', 'delivery'];
  const filterLabels = { all: 'Todos', task: 'Tarefas', mission: 'Missões', purchase: 'Compras', delivery: 'Entregas' };

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold text-white">Histórico de Atividades</h2><p className="text-gray-400 mt-1">Visualize todas as atividades concluídas</p></div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm font-semibold">Filtrar por:</span>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{filterLabels[f]}</button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4"><Calendar size={20} className="text-gray-400" /><h3 className="text-lg font-semibold text-white capitalize">{date}</h3><div className="flex-1 h-px bg-gray-700"></div></div>
            <div className="space-y-3">
              {items.map(item => (
                <div key={`${item.type}-${item.id}`} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><CheckCircle2 size={20} className="text-green-400" /></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${typeColors[item.type]}`}>{typeLabels[item.type]}</span>
                      </div>
                      {item.description && <p className="text-sm text-gray-400 mb-2">{item.description}</p>}
                      <p className="text-xs text-gray-500">{formatDate(item.completed_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredHistory.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhuma atividade concluída no histórico</p></div>}
      </div>
    </div>
  );
}
