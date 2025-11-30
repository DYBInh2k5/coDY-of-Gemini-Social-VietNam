import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio || '',
    avatar: user.avatar,
    coverImage: user.coverImage || ''
  });

  const handleSaveProfile = () => {
    const updatedUser: User = {
        ...user,
        name: editForm.name,
        bio: editForm.bio,
        avatar: editForm.avatar,
        coverImage: editForm.coverImage
    };
    storageService.updateUserProfile(updatedUser);
    setIsEditing(false);
    // Force reload via App level state ideally, but simpler here just to reflect changes in UI is tricky without lifting state or refreshing.
    // For this demo, we assume App.tsx will re-render or we trust the user object prop will be updated next cycle, 
    // but effectively we modified storage. To show changes immediately, we might need to reload or use context.
    // Let's do a quick window reload to reflect all side effects cleanly for this demo level.
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors">
        <div className="h-40 bg-slate-200 dark:bg-slate-700 w-full relative">
          <img 
            src={user.coverImage || "https://picsum.photos/id/193/1000/300"} 
            alt="Cover" 
            className="w-full h-full object-cover" 
          />
          {isEditing && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <input 
                    type="text" 
                    placeholder="URL Ảnh bìa..." 
                    className="bg-white/90 p-2 rounded text-sm w-64"
                    value={editForm.coverImage}
                    onChange={e => setEditForm({...editForm, coverImage: e.target.value})}
                 />
             </div>
          )}
        </div>
        
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="relative group">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-md bg-white dark:bg-slate-700"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer">
                     <span className="text-white text-xs font-bold">Sửa ảnh</span>
                     <input 
                        type="text" 
                        placeholder="URL Avatar" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={e => {
                            const val = prompt("Nhập URL ảnh đại diện:", editForm.avatar);
                            if(val) setEditForm({...editForm, avatar: val});
                        }}
                     />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mb-2">
              {isEditing ? (
                 <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-full text-sm">Hủy</button>
                    <button onClick={handleSaveProfile} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors text-sm shadow-md">Lưu</button>
                 </>
              ) : (
                <>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm">
                        Chỉnh sửa
                    </button>
                    <button 
                        onClick={onLogout}
                        className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 font-semibold rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm"
                    >
                        Đăng xuất
                    </button>
                </>
              )}
            </div>
          </div>

          <div>
            {isEditing ? (
                <div className="space-y-3 mb-4">
                    <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="block w-full text-2xl font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 dark:text-white"
                    />
                    <textarea 
                        value={editForm.bio} 
                        onChange={e => setEditForm({...editForm, bio: e.target.value})}
                        className="block w-full text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1"
                        rows={2}
                    />
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{user.handle}</p>
                    <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
                    {user.bio || "Chưa có tiểu sử."}
                    </p>
                </>
            )}
            
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 dark:text-white">{user.stats?.posts || 0}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Bài viết</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span className="font-bold text-slate-900 dark:text-white">{user.stats?.followers || 0}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Người theo dõi</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <span className="font-bold text-slate-900 dark:text-white">{user.stats?.following || 0}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Đang theo dõi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button className="flex-1 py-3 font-semibold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">Bài viết</button>
        <button className="flex-1 py-3 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Ảnh/Video</button>
        <button className="flex-1 py-3 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Đã thích</button>
      </div>

      {/* Mock User Posts */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
           <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden p-4 transition-colors">
             <div className="flex items-center gap-3 mb-3">
                <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600" alt="avatar" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{user.handle} • {i} ngày trước</p>
                </div>
             </div>
             <p className="text-slate-800 dark:text-slate-200 mb-3">
               {i === 1 ? "Chào mọi người! Đây là ứng dụng mạng xã hội mới của mình. Giao diện đẹp và mượt mà quá! 🚀 #GeminiSocial #React" : "Một ngày làm việc năng suất cùng Gemini API. Khả năng tạo content tự động thật ấn tượng."}
             </p>
             {i === 1 && (
               <div className="rounded-xl overflow-hidden mb-3">
                 <img src="https://picsum.photos/seed/techsetup/600/300" alt="Setup" className="w-full object-cover" />
               </div>
             )}
             <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-700">
                <button className="flex items-center gap-2 hover:text-rose-500"><span className="text-sm font-bold">12</span> Thích</button>
                <button className="flex items-center gap-2 hover:text-indigo-500"><span className="text-sm font-bold">4</span> Bình luận</button>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;