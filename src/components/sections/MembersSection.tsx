import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, Users, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const ROLES = ['Líder', 'Co-Líder', 'Capitão', 'Soldado', 'Recruta'];
const FIVEM_SERVER = 'pkxqmy';

export default function MembersSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: 'Recruta', status: 'active' as const });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', role: '', status: 'active' as const });
  const [serverInfo, setServerInfo] = useState<{ total: number; loading: boolean; error: boolean }>({ total: 0, loading: true, error: false });

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    fetchOnlinePlayers();
    const interval = setInterval(fetchOnlinePlayers, 30000); // atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMembers = async () => setMembers(await api.getMembers());

  const fetchOnlinePlayers = useCallback(async () => {
    setServerInfo(s => ({ ...s, loading: true, error: false }));
    try {
      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${FIVEM_SERVER}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const players: string[] = (data.Data?.players || []).map((p: any) => p.name);
      setOnlinePlayers(players);
      setServerInfo({ total: players.length, loading: false, error: false });
    } catch {
      setServerInfo(s => ({ ...s, loading: false, error: true }));
    }
  }, []);

  const isOnline = (memberName: string) =>
    onlinePlayers.some(p => p.toLowerCase() === memberName.toLowerCase());

  const addMember = async () => {
    if (!newMember.name.trim()) return;
    await api.addMember(newMember);
    setNewMember({ name: '', role: 'Recruta', status: 'active' });
    setIsAdding(false);
    fetchMembers();
  };

  const updateMember = async (id: string) => {
    await api.updateMember(id, editData);
    setEditingId(null);
    fetchMembers();
  };

  const deleteMember = async (id: string) => { await api.deleteMember(id); fetchMembers(); };
  const startEdit = (m: Member) => { setEditingId(m.id); setEditData({ name: m.name, role: m.role, status: m.status }); };

  const active = members.filter(m => m.status === 'active');
  const inactive = members.filter(m => m.status === 'inactive');
  const onlineCount = active.filter(m => isOnline(m.name)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Membros</h2><p className="text-gray-400 mt-1">Gerencie os membros da facção</p></div>
        <div className="flex gap-3">
          <button onClick={fetchOnlinePlayers} title="Atualizar status" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={16} className={serverInfo.loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Novo Membro</button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-blue-100 text-sm">Total</p><Users size={20} className="text-blue-200" /></div>
          <p className="text-3xl font-bold">{members.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-green-100 text-sm">Ativos</p><Users size={20} className="text-green-200" /></div>
          <p className="text-3xl font-bold">{active.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-emerald-100 text-sm">Online Agora</p><Wifi size={20} className="text-emerald-200" /></div>
          <p className="text-3xl font-bold">{serverInfo.loading ? '...' : onlineCount}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-gray-100 text-sm">No Servidor</p><Wifi size={20} className="text-gray-300" /></div>
          <p className="text-3xl font-bold">{serverInfo.loading ? '...' : serverInfo.error ? '—' : serverInfo.total}</p>
        </div>
      </div>

      {/* Status do servidor */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-fit ${serverInfo.error ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
        <div className={`w-2 h-2 rounded-full ${serverInfo.loading ? 'bg-yellow-400 animate-pulse' : serverInfo.error ? 'bg-red-400' : 'bg-green-400'}`}></div>
        {serverInfo.loading ? 'Consultando servidor FiveM...' : serverInfo.error ? 'Não foi possível conectar ao servidor' : `Servidor online • atualiza a cada 30s`}
      </div>

      {/* Form novo membro */}
      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Membro</h3>
          <p className="text-xs text-gray-500 mb-4">⚠️ O nome deve ser <span className="text-yellow-400">exatamente igual</span> ao nome no FiveM para detectar se está online.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Nome (igual ao FiveM)" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={addMember} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Adicionar</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Status FiveM</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Situação</th>
              <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {members.map(m => {
              const online = isOnline(m.name);
              return (
                <tr key={m.id} className={online ? 'bg-green-500/5' : ''}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {serverInfo.loading
                        ? <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                        : online
                          ? <><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div><span className="text-green-400 text-xs font-semibold flex items-center gap-1"><Wifi size={12} /> Online</span></>
                          : <><div className="w-2 h-2 rounded-full bg-gray-500"></div><span className="text-gray-500 text-xs flex items-center gap-1"><WifiOff size={12} /> Offline</span></>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === m.id
                      ? <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white w-full" />
                      : <span className="text-white font-medium">{m.name}</span>}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === m.id
                      ? <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
                      : <span className="text-gray-300">{m.role}</span>}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === m.id
                      ? <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value as any })} className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white"><option value="active">Ativo</option><option value="inactive">Inativo</option></select>
                      : <span className={`px-3 py-1 rounded-full text-xs font-semibold ${m.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{m.status === 'active' ? 'Ativo' : 'Inativo'}</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === m.id
                        ? <button onClick={() => updateMember(m.id)} className="text-green-400 hover:text-green-300"><Save size={18} /></button>
                        : <button onClick={() => startEdit(m)} className="text-gray-400 hover:text-blue-400"><Edit2 size={18} /></button>}
                      <button onClick={() => deleteMember(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {members.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum membro cadastrado</p></div>}
      </div>
    </div>
  );
}
