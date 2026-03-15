import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import StatusBadge from '../StatusBadge';

interface Mission { id: string; title: string; description: string; scheduled_date: string; status: 'pending' | 'completed' | 'urgent'; created_at: string; }

export default function MissionsSection() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState({ title: '', description: '', scheduled_date: '', status: 'pending' as const });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchMissions(); }, []);

  const fetchMissions = async () => setMissions(await api.getMissions());

  const addMission = async () => {
    if (!newMission.title.trim() || !newMission.scheduled_date) return;
    await api.addMission(newMission);
    setNewMission({ title: '', description: '', scheduled_date: '', status: 'pending' });
    setIsAdding(false);
    fetchMissions();
  };

  const updateMissionStatus = async (id: string, status: 'pending' | 'completed' | 'urgent') => {
    await api.updateMission(id, { status });
    fetchMissions();
  };

  const deleteMission = async (id: string) => { await api.deleteMission(id); fetchMissions(); };

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Missões Agendadas</h2><p className="text-gray-400 mt-1">Planeje e acompanhe missões futuras</p></div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Nova Missão</button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nova Missão</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Título da missão" value={newMission.title} onChange={(e) => setNewMission({ ...newMission, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <textarea placeholder="Descrição (opcional)" value={newMission.description} onChange={(e) => setNewMission({ ...newMission, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none" />
            <input type="datetime-local" value={newMission.scheduled_date} onChange={(e) => setNewMission({ ...newMission, scheduled_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <div className="flex gap-3">
              <select value={newMission.status} onChange={(e) => setNewMission({ ...newMission, status: e.target.value as any })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"><option value="pending">Pendente</option><option value="urgent">Urgente</option></select>
              <button onClick={addMission} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Adicionar</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {missions.map(mission => (
          <div key={mission.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1"><h3 className="text-xl font-semibold text-white mb-2">{mission.title}</h3><div className="flex items-center gap-2 text-gray-400 text-sm mb-3"><Calendar size={16} /><span>{formatDate(mission.scheduled_date)}</span></div></div>
              <button onClick={() => deleteMission(mission.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
            </div>
            {mission.description && <p className="text-gray-400 mb-4">{mission.description}</p>}
            <div className="flex items-center justify-between">
              <StatusBadge status={mission.status} />
              <div className="flex gap-2">
                {mission.status !== 'completed' && <button onClick={() => updateMissionStatus(mission.id, 'completed')} className="text-sm text-green-400 hover:text-green-300 transition-colors">Concluir</button>}
                {mission.status !== 'urgent' && mission.status !== 'completed' && <button onClick={() => updateMissionStatus(mission.id, 'urgent')} className="text-sm text-red-400 hover:text-red-300 transition-colors">Urgente</button>}
                {mission.status === 'completed' && <button onClick={() => updateMissionStatus(mission.id, 'pending')} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">Reabrir</button>}
              </div>
            </div>
          </div>
        ))}
        {missions.length === 0 && <div className="col-span-2 text-center py-12"><p className="text-gray-500">Nenhuma missão agendada</p></div>}
      </div>
    </div>
  );
}
