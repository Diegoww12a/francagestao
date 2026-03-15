import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Purchase { id: string; item: string; quantity: number; price: number; status: 'pending' | 'completed'; created_at: string; }

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function PurchasesSection() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [newPurchase, setNewPurchase] = useState({ item: '', quantity: 0, price: 0, status: 'pending' as const });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    const data = await api.getPurchases();
    setPurchases(data.map((d: any) => ({ ...d, price: typeof d.price === 'string' ? parseInt(d.price) : d.price })));
  };

  const addPurchase = async () => {
    if (!newPurchase.item.trim() || newPurchase.quantity <= 0 || newPurchase.price <= 0) return;
    await api.addPurchase(newPurchase);
    setNewPurchase({ item: '', quantity: 0, price: 0, status: 'pending' });
    setIsAdding(false);
    fetchPurchases();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    await api.updatePurchase(id, { status: currentStatus === 'pending' ? 'completed' : 'pending' });
    fetchPurchases();
  };

  const deletePurchase = async (id: string) => { await api.deletePurchase(id); fetchPurchases(); };

  const pendingPurchases = purchases.filter(p => p.status === 'pending');
  const completedPurchases = purchases.filter(p => p.status === 'completed');
  const totalPending = pendingPurchases.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Lista de Compras</h2><p className="text-gray-400 mt-1">Gerencie itens a serem comprados</p></div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Novo Item</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white"><p className="text-blue-100 text-sm mb-2">Total Pendente</p><p className="text-3xl font-bold">R$ {fmt(totalPending)}</p></div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-white"><p className="text-yellow-100 text-sm mb-2">Itens Pendentes</p><p className="text-3xl font-bold">{pendingPurchases.length}</p></div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white"><p className="text-green-100 text-sm mb-2">Itens Concluídos</p><p className="text-3xl font-bold">{completedPurchases.length}</p></div>
      </div>
      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adicionar Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do item" value={newPurchase.item} onChange={(e) => setNewPurchase({ ...newPurchase, item: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <input type="text" placeholder="Quantidade" inputMode="numeric" value={newPurchase.quantity === 0 ? '' : fmt(newPurchase.quantity)} onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); setNewPurchase({ ...newPurchase, quantity: d === '' ? 0 : Number(d) }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <input type="text" placeholder="Preço Unit" inputMode="numeric" value={newPurchase.price === 0 ? '' : fmt(newPurchase.price)} onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); setNewPurchase({ ...newPurchase, price: d === '' ? 0 : Number(d) }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <div className="flex gap-3">
              <button onClick={addPurchase} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Adicionar</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900"><tr><th className="px-6 py-3 text-left text-xs text-gray-400">Item</th><th className="px-6 py-3 text-left text-xs text-gray-400">Qtd</th><th className="px-6 py-3 text-left text-xs text-gray-400">Preço Unit.</th><th className="px-6 py-3 text-left text-xs text-gray-400">Total</th><th className="px-6 py-3 text-left text-xs text-gray-400">Status</th><th className="px-6 py-3 text-right text-xs text-gray-400">Ações</th></tr></thead>
          <tbody className="divide-y divide-gray-700">
            {purchases.map(p => (
              <tr key={p.id} className={p.status === 'completed' ? 'opacity-60' : ''}>
                <td className="px-6 py-4 text-white">{p.item}</td>
                <td className="px-6 py-4 text-gray-300">{fmt(p.quantity)}</td>
                <td className="px-6 py-4 text-gray-300">R$ {fmt(p.price)}</td>
                <td className="px-6 py-4 text-white font-semibold">R$ {fmt(p.price * p.quantity)}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.status === 'completed' ? 'Concluído' : 'Pendente'}</span></td>
                <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => toggleStatus(p.id, p.status)} className="text-gray-400 hover:text-green-400"><CheckCircle2 size={18} /></button><button onClick={() => deletePurchase(p.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={18} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum item na lista</p></div>}
      </div>
    </div>
  );
}
