import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  created_at: string;
}

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function FinanceSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTx, setNewTx] = useState({ type: 'income' as const, description: '', amount: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => setTransactions(await api.getTransactions());

  const addTransaction = async () => {
    if (!newTx.description.trim() || newTx.amount <= 0) return;
    await api.addTransaction(newTx);
    setNewTx({ type: 'income', description: '', amount: 0 });
    setIsAdding(false);
    fetchTransactions();
  };

  const deleteTransaction = async (id: string) => { await api.deleteTransaction(id); fetchTransactions(); };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Finanças</h2><p className="text-gray-400 mt-1">Controle de entradas e saídas do caixa</p></div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Nova Transação</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-6 text-white ${balance >= 0 ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
          <div className="flex items-center justify-between mb-2"><p className="text-sm opacity-80">Saldo Atual</p><DollarSign size={24} className="opacity-70" /></div>
          <p className="text-3xl font-bold">R$ {fmt(balance)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-blue-100 text-sm">Total Entradas</p><TrendingUp size={24} className="text-blue-200" /></div>
          <p className="text-3xl font-bold">R$ {fmt(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-red-100 text-sm">Total Saídas</p><TrendingDown size={24} className="text-red-200" /></div>
          <p className="text-3xl font-bold">R$ {fmt(totalExpense)}</p>
        </div>
      </div>

      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nova Transação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={newTx.type} onChange={(e) => setNewTx({ ...newTx, type: e.target.value as any })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>
            <input type="text" placeholder="Descrição" value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <input type="text" placeholder="Valor" inputMode="numeric" value={newTx.amount === 0 ? '' : fmt(newTx.amount)} onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); setNewTx({ ...newTx, amount: d === '' ? 0 : Number(d) }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addTransaction} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Adicionar</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900"><tr><th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Tipo</th><th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Descrição</th><th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Valor</th><th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Data</th><th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Ações</th></tr></thead>
          <tbody className="divide-y divide-gray-700">
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.type === 'income' ? '↑ Entrada' : '↓ Saída'}</span></td>
                <td className="px-6 py-4 text-white">{t.description}</td>
                <td className={`px-6 py-4 font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'} R$ {fmt(t.amount)}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(t.created_at)}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhuma transação registrada</p></div>}
      </div>
    </div>
  );
}
