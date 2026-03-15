import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';

interface LoginPageProps { onLogin: () => void; }

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.login(password);
      localStorage.setItem('faction_auth', 'true');
      onLogin();
    } catch {
      setError('Senha incorreta.');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl"><Lock size={40} className="text-white" /></div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-2">Gestão da França</h1>
          <p className="text-gray-400 text-center mb-8">Acesso ao Painel Administrativo</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Senha de Acesso</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite a senha" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" disabled={isLoading} autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3"><p className="text-red-400 text-sm font-medium">{error}</p></div>}
            <button type="submit" disabled={isLoading || !password} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95">
              {isLoading ? (<span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Autenticando...</span>) : 'Entrar'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-800"><p className="text-xs text-gray-500 text-center">Sistema seguro de gerenciamento</p></div>
        </div>
        <div className="mt-6 text-center"><p className="text-gray-500 text-sm">Painel Administrativo da França</p></div>
      </div>
    </div>
  );
}
