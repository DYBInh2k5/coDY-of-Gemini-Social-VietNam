import React, { useState, useEffect, useRef } from 'react';
import { Post, User, Story } from '../types';
import { generateFeedPosts, generateComment } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface FeedProps {
  currentUser: User;
}

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [incomingPosts, setIncomingPosts] = useState<Post[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Stories State
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  // Initial Load from Storage
  useEffect(() => {
    const loadPosts = async () => {
      let storedPosts = storageService.getPosts();
      
      // Generate initial data if empty
      if (storedPosts.length === 0) {
        const aiPosts = await generateFeedPosts(3);
        aiPosts.forEach(p => storageService.addPost(p));
        storedPosts = storageService.getPosts();
      }
      
      setPosts(storedPosts);
      setLoading(false);

      // Generate Mock Stories
      const mockStories: Story[] = [
        { id: 's1', user: { id: 'u2', name: 'Minh Anh', handle: '@minhanh', avatar: 'https://picsum.photos/seed/minhanh/200/200' }, imageUrl: 'https://picsum.photos/seed/story1/400/800', hasSeen: false },
        { id: 's2', user: { id: 'u3', name: 'Tuấn Tech', handle: '@tuantech', avatar: 'https://picsum.photos/seed/tech/200/200' }, imageUrl: 'https://picsum.photos/seed/story2/400/800', hasSeen: false },
        { id: 's3', user: { id: 'u4', name: 'Mai Vi Vu', handle: '@mai', avatar: 'https://picsum.photos/seed/travel/200/200' }, imageUrl: 'https://picsum.photos/seed/story3/400/800', hasSeen: false },
        { id: 's4', user: { id: 'u5', name: 'Hùng Gym', handle: '@hung', avatar: 'https://picsum.photos/seed/gym/200/200' }, imageUrl: 'https://picsum.photos/seed/story4/400/800', hasSeen: false },
      ];
      setStories(mockStories);
    };
    loadPosts();
  }, []);

  // "Real-time" Simulation
  useEffect(() => {
    const interval = setInterval(async () => {
      if (Math.random() > 0.7) {
        const newAiPosts = await generateFeedPosts(1);
        if (newAiPosts.length > 0) {
          const newPost = newAiPosts[0];
          storageService.addPost(newPost);
          setIncomingPosts(prev => [newPost, ...prev]);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleShowNewPosts = () => {
    setPosts(prev => [...incomingPosts, ...prev]);
    setIncomingPosts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setSelectedImage(url);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedImage) return;

    const newPost: Post = {
      id: `local-${Date.now()}`,
      author: currentUser,
      content: newPostContent,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      displayTimestamp: 'Vừa xong',
      image: selectedImage || undefined,
      likedBy: []
    };

    storageService.addPost(newPost);
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setSelectedImage(null);
    
    // Simulate AI Interaction
    setTimeout(async () => {
      try {
        const commentText = await generateComment(newPostContent);
        const aiComment = {
          id: `comment-${Date.now()}`,
          author: {
            id: 'ai-fan',
            name: 'Fan Cứng AI',
            handle: '@fancung',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fan',
            isCurrentUser: false
          },
          content: commentText,
          timestamp: new Date().toISOString()
        };
        
        storageService.addComment(newPost.id, aiComment);
        
        setPosts(currentPosts => currentPosts.map(p => {
          if (p.id === newPost.id) {
            return {
              ...p,
              comments: [...p.comments, aiComment],
              likes: p.likes + 1,
              likedBy: [...p.likedBy, 'ai-fan']
            };
          }
          return p;
        }));
      } catch (e) { console.error(e); }
    }, 8000);
  };

  const handleLike = (postId: string) => {
    const updatedPosts = storageService.toggleLike(postId, currentUser.id);
    setPosts(updatedPosts);
  };

  const getTimeDisplay = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 relative">
      
      {/* Stories Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-6 border border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {/* Create Story */}
          <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
            <div className="relative w-16 h-16">
              <img src={currentUser.avatar} alt="Me" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-700 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tạo tin</span>
          </div>

          {/* Friends Stories */}
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group" onClick={() => setViewingStory(story)}>
               <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-slate-800">
                    <img src={story.user.avatar} alt={story.user.name} className="w-full h-full rounded-full object-cover" />
                  </div>
               </div>
               <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-16 text-center">{story.user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingStory(null)}>
          <div className="relative max-w-sm w-full h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={viewingStory.imageUrl} className="w-full h-full object-cover" alt="Story" />
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={viewingStory.user.avatar} className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
                <span className="text-white font-bold text-sm">{viewingStory.user.name}</span>
                <span className="text-white/70 text-xs">3 giờ</span>
              </div>
              <button onClick={() => setViewingStory(null)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
               <div className="flex gap-2">
                 <input type="text" placeholder="Gửi tin nhắn..." className="bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/70 w-full focus:outline-none backdrop-blur-md" />
                 <button className="p-2 hover:scale-110 transition-transform text-2xl">❤️</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* New Posts Indicator */}
      {incomingPosts.length > 0 && (
        <div className="sticky top-4 z-30 flex justify-center mb-4 animate-bounce">
          <button 
            onClick={handleShowNewPosts}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            Có {incomingPosts.length} bài viết mới
          </button>
        </div>
      )}

      {/* Create Post Input */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-6 border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex gap-3">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" 
          />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`${currentUser.name} ơi, bạn đang nghĩ gì thế?`}
              className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              rows={2}
            />
            
            {selectedImage && (
              <div className="relative mt-2">
                <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2 text-indigo-500 dark:text-indigo-400">
                 <input 
                   type="file" 
                   ref={imageInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleImageSelect}
                 />
                 <button 
                   onClick={() => imageInputRef.current?.click()}
                   className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="hidden sm:inline">Ảnh/Video</span>
                 </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !selectedImage}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 dark:shadow-none"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => {
            const isLiked = post.likedBy.includes(currentUser.id);
            return (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-600" 
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight flex items-center gap-1">
                          {post.author.name}
                          {post.author.isCurrentUser && <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 px-1.5 rounded-md">Bạn</span>}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">{post.author.handle} • {getTimeDisplay(post.timestamp)}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-slate-800 dark:text-slate-200 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-3 -mx-4">
                      <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-50 dark:border-slate-700">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                      <span className="text-sm font-bold">{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-indigo-500 transition-colors group">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                      </svg>
                      <span className="text-sm font-bold">{post.comments.length}</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors group ml-auto">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 bg-slate-50/80 dark:bg-slate-700/50 p-3 rounded-xl space-y-3 transition-colors">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <img src={comment.author.avatar} className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-600 shadow-sm" alt="commenter" />
                          <div className="flex-1">
                            <div className="bg-white dark:bg-slate-600 p-2 rounded-lg rounded-tl-none shadow-sm inline-block transition-colors">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">{comment.author.name}</span>
                              <span className="text-sm text-slate-700 dark:text-slate-200">{comment.content}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block ml-1 mt-1">vừa xong</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;