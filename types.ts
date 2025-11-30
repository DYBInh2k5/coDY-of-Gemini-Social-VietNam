export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isCurrentUser?: boolean;
  bio?: string;
  coverImage?: string;
  stats?: UserStats;
  password?: string; // For simulation auth
  joinedDate?: string;
  followingIds?: string[]; // List of user IDs this user follows
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  timestamp: string; // ISO string for sorting
  displayTimestamp?: string; // Friendly display
  likedBy: string[]; // Array of user IDs who liked
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

export interface ChatSession {
  id: string;
  partner: User;
  messages: Message[];
  lastMessage: string;
  unread: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  actor: User;
  content?: string;
  timestamp: string;
  read: boolean;
  targetPostId?: string;
}

export interface Story {
  id: string;
  user: User;
  imageUrl: string;
  hasSeen: boolean;
}