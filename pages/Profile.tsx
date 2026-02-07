import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Settings, Edit2, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { user, entitlements, refreshUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState(user?.birth_date || '');

  const saveProfile = async () => {
    if(!newDate) return;
    try {
      await api.updateMe({ birth_date: newDate });
      await refreshUser();
      setEditing(false);
    } catch (e) {
      alert('Error updating profile');
    }
  };

  return (
    <div className="min-h-[100dvh] pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))] px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />

      <h1 className="text-2xl font-bold mb-6 text-center text-white">Профиль</h1>

      {/* User Info Card */}
      <div className="glass-panel rounded-2xl p-6 mb-8 relative overflow-hidden">
         {/* Decorative circle */}
         <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

         <div className="flex items-center gap-5 mb-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg text-white border-2 border-white/10">
               {user?.first_name?.[0] || 'U'}
            </div>
            <div>
               <h2 className="font-bold text-xl text-white">{user?.first_name}</h2>
               {user?.username && <p className="text-sm text-gray-400">@{user.username}</p>}
               <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">ID: {user?.telegram_id}</p>
            </div>
         </div>

         <div className="bg-mystic-dark/40 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
               <label className="text-[10px] text-gray-400 uppercase tracking-widest">Дата рождения</label>
               {!editing && (
                 <button onClick={() => setEditing(true)} className="text-amber-400 hover:text-amber-300 transition-colors">
                    <Edit2 size={14} />
                 </button>
               )}
            </div>
            {editing ? (
               <div className="flex gap-2">
                  <input 
                     type="date" 
                     value={newDate} 
                     onChange={(e) => setNewDate(e.target.value)}
                     className="bg-mystic-dark border border-white/20 rounded px-3 py-1.5 flex-1 text-white text-sm focus:outline-none focus:border-amber-500" 
                  />
                  <button onClick={saveProfile} className="bg-amber-500 text-mystic-dark px-3 py-1 rounded text-xs font-bold">OK</button>
               </div>
            ) : (
               <div className="text-white font-mono text-lg tracking-wide">
                  {user?.birth_date?.split('-').reverse().join('.') || 'Не указана'}
               </div>
            )}
         </div>
      </div>

      {/* Entitlements */}
      <h3 className="font-bold text-lg mb-4 text-white px-2">Мои ресурсы</h3>
      <div className="space-y-3">
         {entitlements.length === 0 && (
            <div className="glass-panel p-6 rounded-xl text-center border-dashed border-white/10">
               <p className="text-gray-500 text-sm">Активные подписки отсутствуют</p>
            </div>
         )}
         {entitlements.map((e, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl flex justify-between items-center group">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                     <div className="font-bold text-sm text-white">{e.product_code}</div>
                     {e.expires_at && (
                       <div className="text-[10px] text-gray-400">
                         Истекает: <span className="text-gray-300">{new Date(e.expires_at).toLocaleDateString()}</span>
                       </div>
                     )}
                  </div>
               </div>
               <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    {e.is_subscription ? 'PRO' : `${e.quantity} шт`}
                  </span>
               </div>
            </div>
         ))}
      </div>

      <div className="mt-12 text-center space-y-3">
         <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-500 text-xs hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 text-xs hover:text-white transition-colors">Support</a>
         </div>
         <p className="text-[10px] text-gray-700">v1.0.0 Matrix AI</p>
      </div>
    </div>
  );
};