import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import MysticButton from '../components/UI/MysticButton';
import { haptic } from '../services/telegram';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await api.getUser();
    setUser(u);
    setEditDate(u.birthDate || '');
  };

  const handleSave = async () => {
    if (!editDate) return;
    setLoading(true);
    haptic.selection();
    try {
      await api.updateProfile({ birthDate: editDate });
      await loadUser();
      setIsEditing(false);
      haptic.success();
    } catch (e) {
      console.error(e);
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = () => {
    haptic.selection();
    alert("История покупок пока пуста");
  };

  if (!user) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin text-4xl">🔮</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Профиль</h1>

      {/* User Info Card */}
      <div className="bg-mystic-800 rounded-xl p-6 border border-mystic-600 flex items-center space-x-4 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-mystic-900 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
           {user.firstName?.[0] || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user.firstName || 'Пользователь'}</h2>
          <p className="text-gray-400 text-sm">@{user.username || 'unknown'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-mystic-800 p-4 rounded-xl border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl">🃏</div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Кредиты</p>
            <p className="text-2xl font-bold text-white">{user.credits} <span className="text-sm font-normal text-gray-400">расклад(ов)</span></p>
         </div>
         <div className="bg-mystic-800 p-4 rounded-xl border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl">⭐</div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Подписка</p>
            <p className={`text-xl font-bold ${user.isPremium ? 'text-gold-400' : 'text-gray-300'}`}>
              {user.isPremium ? 'PREMIUM' : 'FREE'}
            </p>
         </div>
      </div>

      {/* Settings Section */}
      <div className="bg-mystic-800 rounded-xl border border-mystic-600 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-gold-400 font-bold mb-4 uppercase text-xs tracking-wider">Личные данные</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Дата рождения</span>
            {!isEditing && (
              <button 
                onClick={() => { setIsEditing(true); haptic.selection(); }} 
                className="text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors"
              >
                Изменить
              </button>
            )}
          </div>
          
          {isEditing ? (
             <div className="flex space-x-2 mt-2">
               <input 
                  type="text" 
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-mystic-900 border border-gold-500/50 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:border-gold-400"
                  placeholder="ДД.ММ.ГГГГ"
               />
               <MysticButton 
                  onClick={handleSave} 
                  isLoading={loading} 
                  className="!py-2 !px-4 text-sm min-w-[60px]"
               >
                 OK
               </MysticButton>
             </div>
          ) : (
            <p className="text-white font-medium text-lg">{user.birthDate || 'Не указана'}</p>
          )}
        </div>

        {/* Menu Items */}
        <div className="divide-y divide-white/5">
          <button 
            onClick={handleHistoryClick}
            className="w-full p-4 text-left text-white hover:bg-white/5 flex justify-between items-center transition-colors active:bg-white/10"
          >
             <div className="flex items-center space-x-3">
               <span className="text-xl">📜</span>
               <span>История покупок</span>
             </div>
             <span className="text-gray-500">›</span>
          </button>
          
          <button className="w-full p-4 text-left text-white hover:bg-white/5 flex justify-between items-center transition-colors active:bg-white/10">
             <div className="flex items-center space-x-3">
               <span className="text-xl">💬</span>
               <span>Поддержка</span>
             </div>
             <span className="text-gray-500">›</span>
          </button>
        </div>
      </div>

       <div className="text-center space-y-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">User ID: {user.id}</p>
          <p className="text-[10px] text-gray-600">v1.0.0 • Destiny Matrix AI</p>
       </div>
    </div>
  );
};

export default Profile;