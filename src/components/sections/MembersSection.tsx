import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Users, Wifi, WifiOff, RefreshCw, X, Calendar, Shield } from 'lucide-react';
import { api } from '../../lib/api';

interface Member { id: string; name: string; role: string; kick_channel: string; avatar_url: string; joined_at: string; status: 'active' | 'inactive'; created_at: string; }
interface LiveStatus { isLive: boolean; loading: boolean; }

const ROLES = ['Líder', 'Co-Líder', 'Capitão', 'Soldado', 'Recruta'];
type FilterType = 'all' | 'online' | 'offline';

function MemberModal({ member, liveStatus, onClose }: { member: Member; liveStatus?: LiveStatus; onClose: () => void; }) {
  const isLive = liveStatus?.isLive;
  const joinedDate = member.joined_at ? new Date(member.joined_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const createdDate = new Date(member.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const diasNaFaccao = () => {
    const base = member.joined_at || member.created_at;
    const diff = Date.now() - new Date(base).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl"></div>
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white"><X size={20} /></button>
          <div className="absolute -bottom-10 left-6">
           <div className="w-20 h-20 rounded-full border-4 border-gray-900 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">{member.name.charAt(0).toUpperCase()}</div>
          </div>
          {member.kick_channel && (
            <div className={`absolute -bottom-4 right-6 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isLive ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {isLive ? <><Wifi size={10} /> Online</> : <><WifiOff size={10} /> Offline</>}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-14 px-6 pb-6">
          <h2 className="text-2xl font-bold text-white">{member.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{member.role}</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm"><Shield size={16} /> Situação</div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{member.status === 'active' ? 'Ativo' : 'Inativo'}</span>
            </div>

            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm"><Calendar size={16} /> Entrou em</div>
              <span className="text-white text-sm">{joinedDate !== '—' ? joinedDate : createdDate}</span>
            </div>

            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">⏱️ Tempo na facção</div>
              <span className="text-white text-sm font-semibold">{diasNaFaccao()} dias</span>
            </div>

            {member.kick_channel && (
              <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">🎮 Canal Kick</div>
                <a href={`https://kick.com/${member.kick_channel}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">kick.com/{member.kick_channel}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, LiveStatus>>({});
  const [newMember, setNewMember] = useState({ name: '', role: 'Recruta', kick_channel: '', joined_at: '', status: 'active' as const });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', role: '', kick_channel: '', joined_at: '', status: 'active' as const });
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const data = await api.getMembers();
    setMembers(data);
    fetchAllLiveStatuses(data);
  };

  const fetchAllLiveStatuses = async (memberList: Member[]) => {
    const withKick = memberList.filter(m => m.kick_channel?.trim());
    const initial: Record<string, LiveStatus> = {};
    withKick.forEach(m => { initial[m.id] = { isLive: false, loading: true }; });
    setLiveStatuses(initial);

    await Promise.all(withKick.map(async (m) => {
      try {
        const channel = m.kick_channel.trim().replace('https://kick.com/', '').replace('kick.com/', '');
        const res = await fetch(`https://kick.com/api/v2/channels/${channel}`);
        const data = await res.json();
        const isLive = data.livestream?.is_live === true;
        setLiveStatuses(prev => ({ ...prev, [m.id]: { isLive, loading: false } }));
      } catch {
        setLiveStatuses(prev => ({ ...prev, [m.id]: { isLive: false, loading: false } }));
      }
    }));
  };

  const addMember = async () => {
    if (!newMember.name.trim()) return;
    await api.addMember(newMember);
    setNewMember({ name: '', role: 'Recruta', kick_channel: '', joined_at: '', status: 'active' });
    setIsAdding(false);
    fetchMembers();
  };

  const updateMember = async (id: string) => {
    await api.updateMember(id, editData);
    setEditingId(null);
    fetchMembers();
  };

  const deleteMember = async (id: string) => { await api.deleteMember(id); fetchMembers(); };
  const startEdit = (m: Member) => { setEditingId(m.id); setEditData({ name: m.name, role: m.role, kick_channel: m.kick_channel || '', avatar_url: m.avatar_url || '', joined_at: m.joined_at || '', status: m.status }); };

  const active = members.filter(m => m.status === 'active');
  const liveCount = Object.values(liveStatuses).filter(s => s.isLive).length;

  const sortedMembers = [...members].sort((a, b) => {
    const aLive = liveStatuses[a.id]?.isLive ? 1 : 0;
    const bLive = liveStatuses[b.id]?.isLive ? 1 : 0;
    return bLive - aLive;
  });

  const filteredMembers = sortedMembers.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'online') return liveStatuses[m.id]?.isLive === true;
    if (filter === 'offline') return !liveStatuses[m.id]?.isLive;
    return true;
  });

  return (
    <div className="space-y-6">
      {selectedMember && <MemberModal member={selectedMember} liveStatus={liveStatuses[selectedMember.id]} onClose={() => setSelectedMember(null)} />}

      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Membros</h2><p className="text-gray-400 mt-1">Gerencie os membros da facção</p></div>
        <div className="flex gap-3">
          <button onClick={() => fetchAllLiveStatuses(members)} title="Atualizar" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Novo Membro</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-5 text-white"><div className="flex items-center justify-between mb-2"><p className="text-blue-100 text-sm">Total</p><Users size={20} className="text-blue-200" /></div><p className="text-3xl font-bold">{members.length}</p></div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-5 text-white"><p className="text-green-100 text-sm mb-2">Ativos</p><p className="text-3xl font-bold">{active.length}</p></div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-5 text-white"><p className="text-gray-100 text-sm mb-2">Inativos</p><p className="text-3xl font-bold">{members.length - active.length}</p></div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-5 text-white"><div className="flex items-center justify-between mb-2"><p className="text-red-100 text-sm">Ao Vivo</p><Wifi size={20} className="text-red-200 animate-pulse" /></div><p className="text-3xl font-bold">{liveCount}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm font-semibold">Filtrar:</span>
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Todos ({members.length})</button>
        <button onClick={() => setFilter('online')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'online' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><Wifi size={14} /> Online ({liveCount})</button>
        <button onClick={() => setFilter('offline')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'offline' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><WifiOff size={14} /> Offline ({members.length - liveCount})</button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Membro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do membro" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div>
             <label className="text-xs text-gray-400 mb-1 block">Canal do Kick</label>
             <input type="text" placeholder="ex: KroozzNS" value={newMember.kick_channel} onChange={(e) => setNewMember({ ...newMember, kick_channel: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Data de entrada</label>
              <input type="date" value={newMember.joined_at} onChange={(e) => setNewMember({ ...newMember, joined_at: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />            
            </div>
            <div className="flex gap-3 items-end">
              <button onClick={addMember} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Adicionar</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Canal Kick</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Situação</th>
              <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
  {filteredMembers.map(m => {
    const live = liveStatuses[m.id];
    const hasKick = m.kick_channel?.trim();

    return (
      <tr
        key={m.id}
        onClick={() => editingId !== m.id && setSelectedMember(m)}
        className={`cursor-pointer hover:bg-gray-700/50 transition-colors ${live?.isLive ? 'bg-green-500/5' : ''}`}
      >
        <td className="px-6 py-4">
          {!hasKick ? (
            <span className="text-gray-600 text-xs">—</span>
          ) : live?.loading ? (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div> ...
            </span>
          ) : live?.isLive ? (
            <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              Offline
            </span>
          )}
        </td>

        <td className="px-6 py-4">
          {editingId === m.id ? (
            <input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white w-full"
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(m);
              }}
              className="text-white font-medium hover:text-blue-400 transition-colors text-left"
            >
              {m.name}
            </button>
          )}
        </td>

        <td className="px-6 py-4">
          {editingId === m.id ? (
            <select
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          ) : (
            <span className="text-gray-300">{m.role}</span>
          )}
        </td>

        <td className="px-6 py-4">
          {editingId === m.id ? (
            <input
              value={editData.kick_channel}
              onChange={(e) => setEditData({ ...editData, kick_channel: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="canal"
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white w-full"
            />
          ) : (
            <span className="text-gray-400 text-sm">
              {m.kick_channel || '—'}
            </span>
          )}
        </td>

        <td className="px-6 py-4">
          {editingId === m.id ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                m.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {m.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          )}
        </td>

        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {editingId === m.id ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateMember(m.id);
                }}
                className="text-green-400 hover:text-green-300"
              >
                Salvar
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(m);
                }}
                className="text-gray-400 hover:text-blue-400"
              >
                Editar
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteMember(m.id);
              }}
              className="text-gray-400 hover:text-red-400"
            >
              Excluir
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
        {filteredMembers.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum membro encontrado</p></div>}
      </div>
    </div>
  );
}
