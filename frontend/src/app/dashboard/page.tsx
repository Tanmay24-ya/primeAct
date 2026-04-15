'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Plus, 
  Trash2, 
  LogOut, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  DollarSign,
  Activity,
  History,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ totalTrades: 0, totalVolume: 0, avgPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTrade, setNewTrade] = useState({ symbol: '', quantity: '', price: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tradesRes, statsRes] = await Promise.all([
        api.get(`/trades?page=${page}&symbol=${search}`),
        api.get('/trades/stats')
      ]);
      setTrades(tradesRes.data.data.trades);
      setTotalPages(tradesRes.data.data.pagination.pages);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to sync with market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, page, search]);

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/trades', newTrade);
      toast.success(`${newTrade.symbol} positioning recorded`);
      setShowModal(false);
      setNewTrade({ symbol: '', quantity: '', price: '' });
      fetchDashboardData();
    } catch (err) {
      toast.error('Transaction failed to broadcast');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/trades/${id}`);
      toast.info('Position liquidated');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  if (authLoading || !user) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-8 glass hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">PrimeTrade</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600/10 text-purple-400 rounded-xl font-medium border border-purple-500/20">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 rounded-xl transition-colors">
            <History className="w-5 h-5" /> Order History
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
          <div className="px-4 mb-4">
            <p className="text-xs text-slate-500 uppercase font-semibold">User Context</p>
            <p className="text-sm font-medium text-slate-300 truncate">{user.email}</p>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full mt-1 inline-block uppercase font-bold">
              {user.role} Access
            </span>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Market Intelligence</h1>
            <p className="text-slate-400">Welcome back, scanning real-time positioning.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 neon-glow transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Position
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Positions', value: stats.totalTrades, icon: LayoutDashboard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Cumulative Volume', value: stats.totalVolume.toLocaleString(), icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Mean Entry Price', value: `$${stats.avgPrice.toFixed(2)}`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <stat.icon className={`${stat.color} w-6 h-6`} />
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent skew-y-12 translate-x-12 -translate-y-12" />
            </motion.div>
          ))}
        </div>

        {/* Portfolio Table */}
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Recent Transactions <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{trades.length}</span>
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search symbol..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Asset Symbol</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Price (USD)</th>
                  <th className="px-6 py-4 font-semibold">Recorded At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <Activity className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-lg font-medium">No positions identified</p>
                        <p className="text-sm">Enter a new trade to begin tracking your portfolio intelligence.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trades.map((trade: any) => (
                    <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-xs text-purple-400">
                            {trade.symbol.substring(0, 1)}
                          </div>
                          <span className="font-bold text-slate-200">{trade.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{trade.quantity}</td>
                      <td className="px-6 py-4 font-mono text-cyan-400">${trade.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(trade.id)}
                          className="text-slate-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing page <span className="text-slate-300 font-medium">{page}</span> of <span className="text-slate-300 font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Trade Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass rounded-3xl p-8 relative z-10 border border-slate-700 shadow-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-purple-400 w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold">New Position</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddTrade} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Asset Symbol</label>
                  <input 
                    type="text" 
                    required
                    maxLength={10}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                    placeholder="e.g. BTC"
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Quantity</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="0.00"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Entry Price</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="65000"
                      value={newTrade.price}
                      onChange={(e) => setNewTrade({...newTrade, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Estimated Exposure</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      ${(Number(newTrade.quantity || 0) * Number(newTrade.price || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl neon-glow transition-all flex items-center justify-center gap-2 group"
                >
                  Broadcast to Portfolio <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
