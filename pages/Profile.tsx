import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MysticButton } from '../components/MysticButton';
import { api } from '../api/client';

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
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>

      {/* User Info */}
      <div className="bg-mystic-purple/50 rounded-xl p-4 mb-6 border border-white/5">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
               {user?.first_name?.[0] || 'U'}
            </div>
            <div>
               <h2 className="font-bold text-lg">{user?.first_name} {user?.username && `(@${user.username})`}</h2>
               <p className="text-sm text-gray-400">ID: {user?.telegram_id}</p>
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-xs text-gray-400 block">Дата рождения</label>
            {editing ? (
               <div className="flex gap-2">
                  <input 
                     type="date" 
                     value={newDate} 
                     onChange={(e) => setNewDate(e.target.value)}
                     className="bg-mystic-dark border border-white/20 rounded px-2 py-1 flex-1" 
                  />
                  <button onClick={saveProfile} className="text-amber-400 text-sm">Сохр.</button>
               </div>
            ) : (
               <div className="flex justify-between items-center">
                  <span>{user?.birth_date || 'Не указана'}</span>
                  <button onClick={() => setEditing(true)} className="text-amber-400 text-sm">Изм.</button>
               </div>
            )}
         </div>
      </div>

      {/* Entitlements */}
      <h3 className="font-bold text-lg mb-4">Мои ресурсы</h3>
      <div className="space-y-3">
         {entitlements.length === 0 && (
            <p className="text-gray-500 text-sm">У вас пока нет активных подписок или пакетов.</p>
         )}
         {entitlements.map((e, idx) => (
            <div key={idx} className="bg-mystic-light/30 p-3 rounded-lg flex justify-between items-center">
               <div>
                  <div className="font-bold text-sm">{e.product_code}</div>
                  {e.expires_at && <div className="text-xs text-gray-400">До: {new Date(e.expires_at).toLocaleDateString()}</div>}
               </div>
               <div className="font-mono text-amber-400">
                  {e.is_subscription ? 'АКТИВНО' : `${e.quantity} шт.`}
               </div>
            </div>
         ))}
         <div className="mt-4 p-4 bg-white/5 rounded-lg text-center">
           <p className="text-gray-400">История покупок скоро появится</p>
         </div>
      </div>

      <div className="mt-10 text-center space-y-4">
         <a href="#" className="block text-gray-500 text-xs hover:text-white">Политика конфиденциальности</a>
         <a href="#" className="block text-gray-500 text-xs hover:text-white">Поддержка</a>
         <p className="text-[10px] text-gray-600">v1.0.0 Matrix AI</p>
      </div>
    </div>
  );
};
