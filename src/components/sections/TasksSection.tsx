import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import StatusBadge from '../StatusBadge';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'urgent';
  created_at: string;
}

export default function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' as const });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const data = await api.getTasks();
    setTasks(data);
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    await api.addTask(newTask);
    setNewTask({ title: '', description: '', status: 'pending' });
    setIsAdding(false);
    fetchTasks();
  };

  const updateTaskStatus = async (id: string, status: 'pending' | 'completed' | 'urgent') => {
    await api.updateTask(id, { status });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    fetchTasks();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const urgentTasks = tasks.filter(t => t.status === 'urgent');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Tarefas Diárias</h2>
          <p className="text-gray-400 mt-1">Gerencie as atividades do dia a dia</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={20} /> Nova Tarefa
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nova Tarefa</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Título da tarefa" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <textarea placeholder="Descrição (opcional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none" />
            <div className="flex gap-3">
              <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                <option value="pending">Pendente</option>
                <option value="urgent">Urgente</option>
              </select>
              <button onClick={addTask} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Adicionar</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4"><AlertCircle className="text-yellow-400" size={24} /><h3 className="text-lg font-semibold text-white">Pendentes ({pendingTasks.length})</h3></div>
          <div className="space-y-3">
            {pendingTasks.map(task => <TaskCard key={task.id} task={task} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} />)}
            {pendingTasks.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma tarefa pendente</p>}
          </div>
        </div>
        <div className="bg-gray-800 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4"><AlertCircle className="text-red-400" size={24} /><h3 className="text-lg font-semibold text-white">Urgentes ({urgentTasks.length})</h3></div>
          <div className="space-y-3">
            {urgentTasks.map(task => <TaskCard key={task.id} task={task} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} />)}
            {urgentTasks.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma tarefa urgente</p>}
          </div>
        </div>
        <div className="bg-gray-800 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4"><CheckCircle2 className="text-green-400" size={24} /><h3 className="text-lg font-semibold text-white">Concluídas ({completedTasks.length})</h3></div>
          <div className="space-y-3">
            {completedTasks.map(task => <TaskCard key={task.id} task={task} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} />)}
            {completedTasks.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma tarefa concluída</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdateStatus, onDelete }: { task: any; onUpdateStatus: (id: string, status: any) => void; onDelete: (id: string) => void; }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white">{task.title}</h4>
        <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
      </div>
      {task.description && <p className="text-sm text-gray-400 mb-3">{task.description}</p>}
      <div className="flex items-center justify-between">
        <StatusBadge status={task.status} />
        <div className="flex gap-2">
          {task.status !== 'completed' && <button onClick={() => onUpdateStatus(task.id, 'completed')} className="text-xs text-green-400 hover:text-green-300 transition-colors">Concluir</button>}
          {task.status !== 'urgent' && task.status !== 'completed' && <button onClick={() => onUpdateStatus(task.id, 'urgent')} className="text-xs text-red-400 hover:text-red-300 transition-colors">Marcar Urgente</button>}
          {task.status === 'completed' && <button onClick={() => onUpdateStatus(task.id, 'pending')} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">Reabrir</button>}
        </div>
      </div>
    </div>
  );
}
