import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

interface Sale { id: string; item: string; quantity: number; price: number; buyer: string; created_at: string; }

const fmtN = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function SalesSection() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [newSale, setNewSale] = useState({ item: '', quantity: '', price: '', buyer: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => setSales(await api.getSales());

  const addSale = async () => {
    if (!newSale.item.trim() || newSale.price.trim() === '') return;
    await api.addSale({
      item: newSale.item,
      quantity: Number(newSale.quantity.replace(/\./g, '')) || 0,
      price: Number(newSale.price.replace(/\./g, '')) || 0,
      buyer: newSale.buyer
    });
    setNewSale({ item: '', quantity: '', price: '', buyer: '' });
    setIsAdding(false);
    fetchSales();
  };

  const deleteSale = async (id: string) => { await api.deleteSale(id); fetchSales(); };

  const totalRevenue = sales.reduce((s, x) => s + x.price * x.quantity, 0);
  const totalItems = sales.reduce((s, x) => s + x.quantity, 0);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-white">Vendas</h2><p className="text-gray-400 mt-1">Registre e acompanhe suas vendas</p></div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={20} /> Nova Venda</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white"><div className="flex items-center justify-between mb-2"><p className="text-green-100 text-sm">Receita Total</p><TrendingUp size={24} className="text-green-200" /></div><p className="text-3xl font-bold">R$ {fmtN(totalRevenue)}</p></div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white"><p className="text-blue-100 text-sm mb-2">Total de Vendas</p><p className="text-3xl font-bold">{sales.length}</p></div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white"><p className="text-purple-100 text-sm mb-2">Itens Vendidos</p><p className="text-3xl font-bold">{fmtN(totalItems)}</p></div>
      </div>
      {isAdding && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Registrar Nova Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Item vendido" value={newSale.item} onChange={(e) => setNewSale({ ...newSale, item: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500" />
            <input type="text" placeholder="Quantidade" value={newSale.quantity} onChange={(e) => { const r = e.target.value.replace(/\D/g, ''); setNewSale({ ...newSale, quantity: r.replace(/\B(?=(\d{3})+(?!\d))/g, '.') }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500" />
            <input type="text" placeholder="Preço Unit" value={newSale.price} onChange={(e) => { const r = e.target.value.replace(/\D/g, ''); setNewSale({ ...newSale, price: r.replace(/\B(?=(\d{3})+(?!\d))/g, '.') }); }} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500" />
            <input type="text" placeholder="Comprador (opcional)" value={newSale.buyer} onChange={(e) => setNewSale({ ...newSale, buyer: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addSale} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Registrar Venda</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
          </div>
        </div>
      )}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Item</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Qtd</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Preço Unit.</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Total</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Comprador</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th></tr></thead>
          <tbody className="divide-y divide-gray-700">
            {sales.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-white">{s.item}</td>
                <td className="px-6 py-4 text-gray-300">{fmtN(s.quantity)}</td>
                <td className="px-6 py-4 text-gray-300">R$ {fmtN(s.price)}</td>
                <td className="px-6 py-4 text-green-400 font-semibold">R$ {fmtN(s.price * s.quantity)}</td>
                <td className="px-6 py-4 text-gray-300">{s.buyer || '-'}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(s.created_at)}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => deleteSale(s.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhuma venda registrada</p></div>}
      </div>
    </div>
  );
}
