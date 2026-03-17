import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Target, X, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Member { id: string; name: string; role: string; status: string; }
interface Goal {
  id: string; member_id: string; title: string; target: number; current: number;
  type: string; deadline: string; status: 'active' | 'completed'; created_at: string;
}

const fmt = (n: number) => n.toLocaleString('pt-BR');
const fmtMoney = (n: number) => `R$ ${fmt(n)}`;

const TYPES = [
  { value: 'sales', label: '💰 Vendas', money: true, color: 'bg-green-500/20 text-green-400' },
  { value: 'free', label: '🎯 Livre', money: true, color: 'bg-blue-500/20 text-blue-400' },
  { value: 'deliveries', label: '📦 Entregas', money: false, color: 'bg-orange-500/20 text-orange-400' },
  { value: 'missions', label: '🗡️ Missões', money: false, color: 'bg-purple-500/20 text-purple-400' },
];

const getTypeInfo = (type: string) => TYPES.find(t => t.value === type) || TYPES[0];
const formatValue = (type: string, value: number) => getTypeInfo(type).money ? fmtMoney(value) : fmt(value);

function GoalCard({ goal, onUpdateProgress, onComplete, onDelete }: {
  goal: Goal;
  onUpdateProgress: (id: string, current: number) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [progressInput, setProgressInput] = useState('');

  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const typeInfo = getTypeInfo(goal.type);
  const missing = goal.target - goal.current;

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
  const getDaysLeft = () => {
    if (!goal.deadline) return null;
    return Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysLeft();

  const handleSave = () => {
    const raw = progressInput.replace(/\D/g, '');
    if (raw === '') { setEditing(false); return; }
    const val = goal.current + Number(raw);
    onUpdateProgress(goal.id, val);
    setEditing(false);
    setProgressInput('');
  };

  const handleStartEdit = () => {
    setProgressInput('');
    setEditing(true);
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-4 border ${isOverdue ? 'border-red-500/40' : 'border-gray-700'}`}>
      {/* Título e tipo */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-white font-medium">{goal.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeInfo.color}`}>{typeInfo.label}</span>
          </div>
          {/* Prazo destacado */}
          {goal.deadline && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              isOverdue
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : daysLeft !== null && daysLeft <= 3
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
            }`}>
              <Calendar size={11} />
              {isOverdue
                ? '⚠️ Prazo expirado'
                : daysLeft === 0 ? '🔴 Vence hoje'
                : daysLeft === 1 ? '🟡 Vence amanhã'
                : daysLeft !== null && daysLeft <= 3 ? `🟡 ${daysLeft} dias restantes`
                : `📅 ${new Date(goal.deadline).toLocaleDateString('pt-BR')} • ${daysLeft} dias`}
            </span>
          )}
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-gray-500 hover:text-red-400 ml-2"><Trash2 size={16} /></button>
      </div>

      {/* Cards de valores */}
      <div className="grid grid-cols-3 gap-2 mb-3 mt-3">
        <div className="bg-gray-900 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 mb-1">Atual</p>
          <p className="text-white font-bold text-sm">{formatValue(goal.type, goal.current)}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 mb-1">Meta</p>
          <p className="text-white font-bold text-sm">{formatValue(goal.type, goal.target)}</p>
        </div>
        <div className={`rounded-lg p-2 text-center ${missing <= 0 ? 'bg-green-500/20' : 'bg-red-500/10'}`}>
          <p className="text-xs text-gray-500 mb-1">Falta</p>
          <p className={`font-bold text-sm ${missing <= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {missing <= 0 ? '✅ 0' : formatValue(goal.type, missing)}
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }}></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">{pct}%</span>
          {pct >= 100 && <span className="text-xs text-green-400 font-semibold">✅ Meta atingida!</span>}
        </div>
      </div>

      {/* Atualizar progresso */}
      <div className="flex items-center gap-3 flex-wrap">
        {editing ? (
          <>
            <input
              type="text"
              inputMode="numeric"
              value={progressInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setProgressInput(raw === '' ? '' : fmt(Number(raw)));
              }}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm w-36 focus:outline-none focus:border-blue-500"
              placeholder={typeInfo.money ? 'Valor atual R$' : 'Quanto somar'}
              autoFocus
            />
            <button onClick={handleSave} className="text-green-400 hover:text-green-300"><Save size={16} /></button>
            <button onClick={() => setEditing(false)} className="text-gray-400 text-sm hover:text-gray-300">Cancelar</button>
          </>
        ) : (
          <button onClick={handleStartEdit} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            <Edit2 size={14} /> Atualizar progresso
          </button>
        )}
        {pct >= 100 && !editing && (
          <button onClick={() => onComplete(goal.id)} className="ml-auto flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg">
            <CheckCircle2 size={14} /> Concluir
          </button>
        )}
      </div>
    </div>
  );
}

function MemberGoalsModal({ member, goals, onClose, onAdd, onUpdateProgress, onComplete, onReopen, onDelete }: {
  member: Member; goals: Goal[]; onClose: () => void;
  onAdd: (data: any) => void; onUpdateProgress: (id: string, current: number) => void;
  onComplete: (id: string) => void; onReopen: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: 0, type: 'sales', deadline: '' });

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');

  const handleAdd = () => {
    if (!newGoal.title.trim() || newGoal.target <= 0) return;
    onAdd(newGoal);
    setNewGoal({ title: '', target: 0, type: 'sales', deadline: '' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{member.name}</h2>
              <p className="text-gray-400 text-sm">{member.role} • {active.length} ativas, {completed.length} concluídas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
              <Plus size={16} /> Nova Meta
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isAdding && (
            <div className="bg-gray-800 border border-blue-500/40 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Nova Meta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Título da meta" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 md:col-span-2" />
                <select value={newGoal.type} onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input type="text" placeholder={getTypeInfo(newGoal.type).money ? 'Meta em R$ (ex: 500000)' : 'Meta em quantidade (ex: 10)'} inputMode="numeric" value={newGoal.target === 0 ? '' : fmt(newGoal.target)} onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); setNewGoal({ ...newGoal, target: d === '' ? 0 : Number(d) }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Prazo (opcional)</label>
                  <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAdd} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Adicionar</button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Em Andamento</h3>
              {active.map(goal => (
                <GoalCard key={goal.id} goal={goal} onUpdateProgress={onUpdateProgress} onComplete={onComplete} onDelete={onDelete} />
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Concluídas</h3>
              {completed.map(goal => (
                <div key={goal.id} className="bg-gray-800/50 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-gray-300 font-medium">{goal.title}</h4>
                        <span className="text-green-400 text-xs">✅</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{formatValue(goal.type, goal.current)} / {formatValue(goal.type, goal.target)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onReopen(goal.id)} className="text-xs text-yellow-400 hover:text-yellow-300">Reabrir</button>
                      <button onClick={() => onDelete(goal.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {goals.length === 0 && !isAdding && (
            <div className="text-center py-8">
              <Target size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma meta para {member.name}</p>
              <button onClick={() => setIsAdding(true)} className="mt-3 text-blue-400 hover:text-blue-300 text-sm">+ Adicionar primeira meta</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoalsSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [m, g] = await Promise.all([api.getMembers(), api.getGoals()]);
    setMembers(m.filter((m: Member) => m.status === 'active'));
    setGoals(g);
  };

  const handleAdd = async (memberId: string, data: any) => {
    await api.addGoal({ ...data, member_id: memberId });
    fetchAll();
  };

  const handleUpdateProgress = async (id: string, current: number) => {
    await api.updateGoal(id, { current });
    fetchAll();
  };

  const handleComplete = async (id: string) => { await api.updateGoal(id, { status: 'completed' }); fetchAll(); };
  const handleReopen = async (id: string) => { await api.updateGoal(id, { status: 'active' }); fetchAll(); };
  const handleDelete = async (id: string) => { await api.deleteGoal(id); fetchAll(); };

  const getMemberGoals = (memberId: string) => goals.filter(g => g.member_id === memberId);
  const totalActive = goals.filter(g => g.status === 'active').length;
  const totalCompleted = goals.filter(g => g.status === 'completed').length;
  const isOverdue = (deadline: string) => deadline && new Date(deadline) < new Date();

  return (
    <div className="space-y-6">
      {selectedMember && (
        <MemberGoalsModal
          member={selectedMember}
          goals={getMemberGoals(selectedMember.id)}
          onClose={() => { setSelectedMember(null); fetchAll(); }}
          onAdd={(data) => handleAdd(selectedMember.id, data)}
          onUpdateProgress={handleUpdateProgress}
          onComplete={handleComplete}
          onReopen={handleReopen}
          onDelete={handleDelete}
        />
      )}

      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Metas dos Membros</h2><p className="text-gray-400 mt-1">Clique num membro para ver e gerenciar as metas dele</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-5 text-white"><div className="flex items-center justify-between mb-2"><p className="text-blue-100 text-sm">Membros Ativos</p><Target size={20} className="text-blue-200" /></div><p className="text-3xl font-bold">{members.length}</p></div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-5 text-white"><p className="text-yellow-100 text-sm mb-2">Metas Ativas</p><p className="text-3xl font-bold">{totalActive}</p></div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-5 text-white"><p className="text-green-100 text-sm mb-2">Metas Concluídas</p><p className="text-3xl font-bold">{totalCompleted}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => {
          const memberGoals = getMemberGoals(member.id);
          const active = memberGoals.filter(g => g.status === 'active');
          const completed = memberGoals.filter(g => g.status === 'completed');
          const hasOverdue = active.some(g => isOverdue(g.deadline));
          const avgProgress = active.length > 0
            ? Math.round(active.reduce((s, g) => s + Math.min((g.current / g.target) * 100, 100), 0) / active.length)
            : 0;

          return (
            <div key={member.id} onClick={() => setSelectedMember(member)} className="bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 cursor-pointer transition-all hover:bg-gray-700/50 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{member.name}</h3>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
                {hasOverdue && <span className="text-red-400 text-xs">⚠️</span>}
              </div>
              {active.length > 0 ? (
                <>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Progresso médio</span>
                      <span className="text-white font-semibold">{avgProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${avgProgress >= 75 ? 'bg-green-500' : avgProgress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${avgProgress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs mt-3">
                    <span className="text-yellow-400">{active.length} ativas</span>
                    <span className="text-green-400">{completed.length} concluídas</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma meta — clique para adicionar</p>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-500">Nenhum membro ativo cadastrado</p></div>
      )}
    </div>
  );
}