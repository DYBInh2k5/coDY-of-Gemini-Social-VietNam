import React, { useState, useEffect } from 'react';
import { User } from './types';
import Feed from './components/Feed';
import Chat from './components/Chat';
import Login from './components/Login';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import { storageService } from './services/storageService';

type View = 'home' | 'chat' | 'notifications' | 'profile';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Suggestion users state
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  // Check for persisted session on mount using storageService
  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // Theme init
    const savedTheme = storageService.getTheme();
    if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Load suggested users (exclude me and already followed)
    const allUsers = storageService.getUsers();
    if (user) {
        setSuggestedUsers(allUsers.filter(u => u.id !== user.id && !user.followingIds?.includes(u.id)));
    } else {
        setSuggestedUsers(allUsers);
    }

    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
      const newMode = !darkMode;
      setDarkMode(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
          storageService.setTheme('dark');
      } else {
          document.documentElement.classList.remove('dark');
          storageService.setTheme('light');
      }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // storageService already sets localStorage in login/register methods
    setCurrentView('home');
    // Refresh suggestions
    const allUsers = storageService.getUsers();
    setSuggestedUsers(allUsers.filter(u => u.id !== user.id && !user.followingIds?.includes(u.id)));
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleFollow = (targetId: string) => {
      if (!currentUser) return;
      storageService.toggleFollow(currentUser.id, targetId);
      
      // Update local state to remove from suggestions
      setSuggestedUsers(prev => prev.filter(u => u.id !== targetId));
      
      // Update current user state to reflect new stats/following list
      const updatedUser = storageService.getCurrentUser();
      if (updatedUser) setCurrentUser(updatedUser);
  };

  if (isLoading) return null;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const NavItem = ({ view, icon, label, badge }: { view: View; icon: React.ReactNode; label: string; badge?: number }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-4 px-6 py-3 rounded-full transition-all duration-200 w-full group relative ${
        currentView === view
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <div className={`${currentView === view ? 'scale-110' : 'group-hover:scale-110'} transition-transform relative`}>
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
            {badge}
          </span>
        )}
      </div>
      <span className="text-lg hidden xl:block">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center font-sans transition-colors duration-300`}>
      <div className="w-full max-w-7xl flex relative">
        
        {/* Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col w-20 xl:w-64 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 transition-colors">
          <div className="p-6">
            <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 hidden xl:block tracking-tight cursor-pointer select-none" onClick={() => setCurrentView('home')}>GeminiSocial</h1>
            <div className="xl:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl cursor-pointer" onClick={() => setCurrentView('home')}>G</div>
          </div>
          
          <nav className="flex-1 px-2 space-y-2">
            <NavItem 
              view="home" 
              label="Trang chủ" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>} 
            />
            <NavItem 
              view="chat" 
              label="Tin nhắn" 
              badge={1}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'chat' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>} 
            />
            <NavItem 
              view="notifications" 
              label="Thông báo" 
              badge={2}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'notifications' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>} 
            />
             <NavItem 
              view="profile" 
              label="Hồ sơ" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'profile' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>} 
            />
          </nav>
          
          {/* Dark Mode Toggle */}
          <div className="px-4 mb-2">
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
            >
                {darkMode ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                        <span className="hidden xl:inline">Giao diện Sáng</span>
                    </>
                ) : (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                        <span className="hidden xl:inline">Giao diện Tối</span>
                    </>
                )}
            </button>
          </div>

          <div className="p-4 mb-4">
             <div 
               className="flex items-center gap-3 p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
               onClick={() => setCurrentView('profile')}
             >
                <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                <div className="hidden xl:block overflow-hidden">
                    <p className="font-bold text-sm truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.handle}</p>
                </div>
                <div className="hidden xl:block ml-auto text-slate-400">•••</div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
          <div className="mb-6 md:hidden flex justify-between items-center sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-30 py-2">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">GeminiSocial</h1>
            <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
                    {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                    )}
                </button>
                <div onClick={() => setCurrentView('profile')} className="cursor-pointer">
                    <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600" alt="avatar" />
                </div>
            </div>
          </div>

          {currentView === 'home' && (
            <div className="animate-in fade-in zoom-in duration-300">
               <Feed currentUser={currentUser} />
            </div>
          )}
          
          {currentView === 'chat' && (
             <div className="animate-in slide-in-from-bottom-2 duration-300">
              <Chat currentUser={currentUser} />
             </div>
          )}

          {currentView === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <Notifications />
            </div>
          )}

          {currentView === 'profile' && (
             <div className="animate-in fade-in duration-300">
               <Profile user={currentUser} onLogout={handleLogout} />
             </div>
          )}
        </main>

        {/* Right Sidebar (Suggestions) - Desktop Only */}
        <div className="hidden lg:block w-80 p-6 sticky top-0 h-screen overflow-y-auto border-l border-slate-200 dark:border-slate-800 transition-colors">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 mb-4 transition-colors">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-lg">Đề xuất theo dõi</h3>
             <div className="space-y-4">
                {suggestedUsers.length > 0 ? suggestedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <img src={user.avatar} className="w-10 h-10 rounded-full border border-white dark:border-slate-600" alt="suggested" />
                       <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate w-24">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-24">{user.handle}</p>
                       </div>
                    </div>
                    <button 
                        onClick={() => handleFollow(user.id)}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Follow
                    </button>
                  </div>
                )) : (
                    <p className="text-slate-500 text-sm italic">Bạn đã theo dõi tất cả mọi người! 🎉</p>
                )}
             </div>
          </div>
          
           <div className="text-xs text-slate-400 leading-relaxed px-2">
              <p>© 2024 GeminiSocial VN.</p>
              <p className="mt-1">Powered by Google Gemini API.</p>
           </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)] transition-colors">
            <button onClick={() => setCurrentView('home')} className={`p-2 rounded-full relative ${currentView === 'home' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            </button>
             <button onClick={() => setCurrentView('chat')} className={`p-2 rounded-full relative ${currentView === 'chat' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'chat' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
             <button onClick={() => setCurrentView('notifications')} className={`p-2 rounded-full relative ${currentView === 'notifications' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'notifications' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
             <button onClick={() => setCurrentView('profile')} className={`p-2 rounded-full relative ${currentView === 'profile' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'profile' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;