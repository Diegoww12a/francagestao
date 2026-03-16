import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, RefreshCw, Vault } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';

interface Transaction { id: string; type: 'income' | 'expense'; description: string; amount: number; created_at: string; }

const fmt = (n: number) => n.toLocaleString('pt-BR');

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm">
        <p className="text-gray-400 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: R$ {fmt(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [purchasesData, setPurchasesData] = useState<any[]>([]);
  const [newTx, setNewTx] = useState({ type: 'income' as const, description: '', amount: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSaldo, setIsAddingSaldo] = useState(false);
  const [saldoInput, setSaldoInput] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [txs, sales, purchases] = await Promise.all([
      api.getTransactions(), api.getSales(), api.getPurchases()
    ]);
    setTransactions(txs);
    setSalesTotal(sales.reduce((s: number, x: any) => s + (x.price * x.quantity), 0));
    setPurchasesTotal(purchases.reduce((s: number, x: any) => s + (x.price * x.quantity), 0));
    setSalesData(sales);
    setPurchasesData(purchases);
    setLoading(false);
  };

  const addTransaction = async () => {
    if (!newTx.description.trim() || newTx.amount <= 0) return;
    await api.addTransaction(newTx);
    setNewTx({ type: 'income', description: '', amount: 0 });
    setIsAdding(false);
    fetchAll();
  };

  const addSaldo = async () => {
    if (saldoInput <= 0) return;
    await api.addTransaction({ type: 'income', description: '💰 Saldo adicionado ao cofre', amount: saldoInput });
    setSaldoInput(0);
    setIsAddingSaldo(false);
    fetchAll();
  };

  const deleteTransaction = async (id: string) => { await api.deleteTransaction(id); fetchAll(); };

  const manualIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const manualExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = salesTotal + manualIncome;
  const totalExpense = purchasesTotal + manualExpense;
  const balance = totalIncome - totalExpense;

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const buildChartData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const entradas =
        salesData.filter((x: any) => new Date(x.created_at) >= d && new Date(x.created_at) < next).reduce((s: number, x: any) => s + x.price * x.quantity, 0) +
        transactions.filter(t => t.type === 'income' && new Date(t.created_at) >= d && new Date(t.created_at) < next).reduce((s, t) => s + t.amount, 0);
      const saidas =
        purchasesData.filter((x: any) => new Date(x.created_at) >= d && new Date(x.created_at) < next).reduce((s: number, x: any) => s + x.price * x.quantity, 0) +
        transactions.filter(t => t.type === 'expense' && new Date(t.created_at) >= d && new Date(t.created_at) < next).reduce((s, t) => s + t.amount, 0);
      days.push({ label, entradas, saidas, saldo: entradas - saidas });
    }
    let acc = 0;
    return days.map(d => { acc += d.saldo; return { ...d, saldoAcumulado: acc }; });
  };

  const chartData = buildChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Finanças</h2><p className="text-gray-400 mt-1">Visão consolidada do caixa da facção</p></div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => { setIsAddingSaldo(!isAddingSaldo); setIsAdding(false); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"><DollarSign size={18} /> Adicionar Saldo</button>
          <button onClick={() => { setIsAdding(!isAdding); setIsAddingSaldo(false); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Nova Transação</button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-6 text-white ${balance >= 0 ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
          <div className="flex items-center justify-between mb-2"><p className="text-sm opacity-80">Saldo Total</p><DollarSign size={24} className="opacity-70" /></div>
          <p className="text-4xl font-bold">R$ {fmt(balance)}</p>
          <p className="text-xs opacity-60 mt-2">Vendas + Entradas - Compras - Saídas</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-blue-100 text-sm">Total Entradas</p><TrendingUp size={24} className="text-blue-200" /></div>
          <p className="text-3xl font-bold">R$ {fmt(totalIncome)}</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-blue-200"><span>💰 Vendas</span><span>R$ {fmt(salesTotal)}</span></div>
            <div className="flex justify-between text-xs text-blue-200"><span>➕ Manual</span><span>R$ {fmt(manualIncome)}</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><p className="text-red-100 text-sm">Total Saídas</p><TrendingDown size={24} className="text-red-200" /></div>
          <p className="text-3xl font-bold">R$ {fmt(totalExpense)}</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-red-200"><span><ShoppingCart size={10} className="inline" /> Compras</span><span>R$ {fmt(purchasesTotal)}</span></div>
            <div className="flex justify-between text-xs text-red-200"><span>➖ Manual</span><span>R$ {fmt(manualExpense)}</span></div>
          </div>
        </div>
      </div>

      {/* Adicionar Saldo */}
      {isAddingSaldo && (
        <div className="bg-emerald-900/30 border border-emerald-600/40 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><DollarSign size={20} className="text-emerald-400" /> Adicionar Saldo ao Cofre</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Valor a adicionar</label>
              <input type="text" placeholder="Ex: 50.000" inputMode="numeric" value={saldoInput === 0 ? '' : fmt(saldoInput)} onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); setSaldoInput(d === '' ? 0 : Number(d)); }} className="w-full bg-gray-900 border border-emerald-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-lg" />
            </div>
            <button onClick={addSaldo} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold">Adicionar</button>
            <button onClick={() => setIsAddingSaldo(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Entradas vs Saídas — 7 dias</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Saldo Acumulado — 7 dias</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Line type="monotone" dataKey="saldoAcumulado" name="Saldo" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form transação manual */}
      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nova Transação Manual</h3>
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

      {/* Tabela */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Transações Manuais</h3>
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
          {transactions.length === 0 && <div className="text-center py-8"><p className="text-gray-500">Nenhuma transação manual registrada</p></div>}
        </div>
      </div>
    </div>
  );
}