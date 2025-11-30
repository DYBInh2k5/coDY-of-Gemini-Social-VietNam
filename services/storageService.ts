import { Post, User } from '../types';

const USERS_KEY = 'gemini_social_users';
const POSTS_KEY = 'gemini_social_posts';
const CURRENT_USER_KEY = 'gemini_social_current_user';
const THEME_KEY = 'gemini_social_theme';

// Initialize default data if empty
const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        id: 'u1',
        name: 'Admin Gemini',
        handle: '@admin',
        password: '123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        bio: 'Quản trị viên hệ thống.',
        stats: { posts: 5, followers: 1000, following: 0 },
        joinedDate: new Date().toISOString(),
        followingIds: []
      },
      {
        id: 'u2',
        name: 'Minh Anh',
        handle: '@minhanh_cute',
        password: '123',
        avatar: 'https://picsum.photos/seed/minhanh/200/200',
        bio: 'Yêu màu hồng và ghét sự giả dối 💕',
        stats: { posts: 12, followers: 340, following: 50 },
        joinedDate: new Date().toISOString(),
        followingIds: []
      },
      {
        id: 'u3',
        name: 'Tuấn Tech',
        handle: '@tuantech',
        password: '123',
        avatar: 'https://picsum.photos/seed/tech/200/200',
        bio: 'Coding is life 💻',
        stats: { posts: 8, followers: 120, following: 10 },
        joinedDate: new Date().toISOString(),
        followingIds: []
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify([]));
  }
};

initStorage();

export const storageService = {
  // --- Auth & User Management ---
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  register: (user: User): { success: boolean; message: string; user?: User } => {
    const users = storageService.getUsers();
    if (users.some(u => u.handle === user.handle)) {
      return { success: false, message: 'Tên đăng nhập (handle) đã tồn tại!' };
    }
    const newUser = { 
      ...user, 
      stats: { posts: 0, followers: 0, following: 0 }, 
      joinedDate: new Date().toISOString(),
      followingIds: []
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Đăng ký thành công!', user: newUser };
  },

  login: (handle: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = storageService.getUsers();
    const user = users.find(u => u.handle === handle && u.password === password);
    if (user) {
      const userSafe = { ...user, isCurrentUser: true };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSafe));
      return { success: true, message: 'Đăng nhập thành công', user: userSafe };
    }
    return { success: false, message: 'Sai thông tin đăng nhập' };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateUserProfile: (updatedUser: User) => {
    let users = storageService.getUsers();
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current session if it's the logged in user
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...updatedUser, isCurrentUser: true }));
    }
    
    // Update posts author info (expensive but necessary for a mock without relational DB)
    let posts = storageService.getPosts();
    posts = posts.map(p => {
        if (p.author.id === updatedUser.id) {
            return { ...p, author: { ...p.author, name: updatedUser.name, avatar: updatedUser.avatar, handle: updatedUser.handle } };
        }
        return p;
    });
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  toggleFollow: (currentUserId: string, targetUserId: string): User[] => {
    let users = storageService.getUsers();
    let currentUser = users.find(u => u.id === currentUserId);
    let targetUser = users.find(u => u.id === targetUserId);

    if (!currentUser || !targetUser) return users;

    const isFollowing = currentUser.followingIds?.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.followingIds = currentUser.followingIds?.filter(id => id !== targetUserId) || [];
      currentUser.stats = { ...currentUser.stats!, following: Math.max(0, (currentUser.stats?.following || 1) - 1) };
      targetUser.stats = { ...targetUser.stats!, followers: Math.max(0, (targetUser.stats?.followers || 1) - 1) };
    } else {
      // Follow
      currentUser.followingIds = [...(currentUser.followingIds || []), targetUserId];
      currentUser.stats = { ...currentUser.stats!, following: (currentUser.stats?.following || 0) + 1 };
      targetUser.stats = { ...targetUser.stats!, followers: (targetUser.stats?.followers || 0) + 1 };
    }

    // Save
    users = users.map(u => {
        if (u.id === currentUserId) return currentUser!;
        if (u.id === targetUserId) return targetUser!;
        return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update Session
    if (storageService.getCurrentUser()?.id === currentUserId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...currentUser, isCurrentUser: true }));
    }

    return users;
  },

  // --- Theme ---
  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  },
  
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(THEME_KEY, theme);
  },

  // --- Posts Management ---
  getPosts: (): Post[] => {
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    return posts.sort((a: Post, b: Post) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addPost: (post: Post) => {
    const posts = storageService.getPosts();
    posts.unshift(post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    
    // Update user stats
    const users = storageService.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === post.author.id) {
        return { ...u, stats: { ...u.stats!, posts: (u.stats?.posts || 0) + 1 } };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  },

  toggleLike: (postId: string, userId: string): Post[] => {
    let posts = storageService.getPosts();
    posts = posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedBy.includes(userId);
        let newLikedBy = isLiked ? p.likedBy.filter(id => id !== userId) : [...p.likedBy, userId];
        return {
          ...p,
          likedBy: newLikedBy,
          likes: newLikedBy.length
        };
      }
      return p;
    });
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return posts;
  },

  addComment: (postId: string, comment: any): Post[] => {
    let posts = storageService.getPosts();
    posts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, comment] };
      }
      return p;
    });
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return posts;
  }
};