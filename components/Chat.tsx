import React, { useState, useRef, useEffect } from 'react';
import { Message, User, ChatSession } from '../types';
import { generateChatReply } from '../services/geminiService';

interface ChatProps {
  currentUser: User;
}

// Mock database of users to chat with
const MOCK_USERS: User[] = [
  { id: 'minh-anh', name: 'Minh Anh', handle: '@minhanh_cute', avatar: 'https://picsum.photos/seed/minhanh/200/200', isCurrentUser: false },
  { id: 'tuan-tech', name: 'Tuấn Tech', handle: '@tuantech', avatar: 'https://picsum.photos/seed/tech/200/200', isCurrentUser: false },
  { id: 'lan-foodie', name: 'Lan Ẩm Thực', handle: '@lanfoodie', avatar: 'https://picsum.photos/seed/food/200/200', isCurrentUser: false },
  { id: 'hung-gym', name: 'Hùng Gym', handle: '@hunggym', avatar: 'https://picsum.photos/seed/gym/200/200', isCurrentUser: false },
  { id: 'mai-travel', name: 'Mai Vi Vu', handle: '@maitravel', avatar: 'https://picsum.photos/seed/travel/200/200', isCurrentUser: false },
];

const PERSONAS: Record<string, string> = {
  'minh-anh': 'Bạn là Minh Anh, một cô gái vui tính, trẻ trung, hay dùng emoji và slang tiếng Việt (như "kaka", "hihi", "trời ơi"). Bạn là bạn thân của người dùng.',
  'tuan-tech': 'Bạn là Tuấn, một lập trình viên đam mê công nghệ. Bạn nói chuyện ngắn gọn, súc tích, thích bàn về code, AI, gadget mới. Bạn hay dùng thuật ngữ công nghệ.',
  'lan-foodie': 'Bạn là Lan, một food blogger. Bạn đam mê ăn uống, nấu nướng. Bạn nói chuyện ngọt ngào và luôn gợi ý các món ăn ngon.',
  'hung-gym': 'Bạn là Hùng, huấn luyện viên thể hình. Bạn tràn đầy năng lượng, hay động viên người khác tập luyện ("Cố lên bro!", "No pain no gain").',
  'mai-travel': 'Bạn là Mai, thích du lịch bụi. Bạn phóng khoáng, thích kể về những chuyến đi và trải nghiệm văn hóa mới.'
};

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'minh-anh',
      partner: MOCK_USERS[0],
      messages: [
        {
          id: 'welcome',
          senderId: 'minh-anh',
          content: 'Chào cậu! Hôm nay có gì vui không kể tớ nghe với? 😊',
          timestamp: new Date(),
          isMe: false
        }
      ],
      lastMessage: 'Chào cậu! Hôm nay có gì vui không kể tớ nghe với? 😊',
      unread: 1
    }
  ]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === selectedSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping, selectedSessionId]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Mark as read
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unread: 0 } : s));
  };

  const handleStartChat = (user: User) => {
    const existingSession = sessions.find(s => s.partner.id === user.id);
    if (existingSession) {
      handleSelectSession(existingSession.id);
    } else {
      const newSession: ChatSession = {
        id: user.id,
        partner: user,
        messages: [],
        lastMessage: '',
        unread: 0
      };
      setSessions([newSession, ...sessions]);
      setSelectedSessionId(user.id);
    }
    setSearchTerm('');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !selectedSessionId || !activeSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: input,
      timestamp: new Date(),
      isMe: true
    };

    // Update UI immediately
    const updatedSessions = sessions.map(s => {
      if (s.id === selectedSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          lastMessage: userMsg.content,
          unread: 0
        };
      }
      return s;
    });

    // Move active session to top
    const activeIndex = updatedSessions.findIndex(s => s.id === selectedSessionId);
    if (activeIndex > 0) {
      const session = updatedSessions[activeIndex];
      updatedSessions.splice(activeIndex, 1);
      updatedSessions.unshift(session);
    }

    setSessions(updatedSessions);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Prepare history for AI
    const history = activeSession.messages.map(m => ({
      role: m.isMe ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    // Add the new user message to history effectively for the context, 
    // though geminiService takes `newMessage` separately.

    const partnerId = activeSession.partner.id;
    const persona = PERSONAS[partnerId] || "Bạn là một người bạn ảo thân thiện.";

    try {
      const replyText = await generateChatReply(history, currentInput, persona);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: partnerId,
        content: replyText,
        timestamp: new Date(),
        isMe: false
      };

      setSessions(prev => prev.map(s => {
        if (s.id === partnerId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg],
            lastMessage: replyText
          };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Filter users for search
  const filteredUsers = searchTerm 
    ? MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.handle.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-40px)] bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50 ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200/60 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Tin nhắn</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm bạn bè..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {searchTerm ? (
            <div className="p-2">
              <p className="text-xs font-semibold text-slate-500 px-2 py-2">KẾT QUẢ TÌM KIẾM</p>
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <button 
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left"
                >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.handle}</p>
                  </div>
                </button>
              )) : (
                <p className="text-center text-slate-400 py-4 text-sm">Không tìm thấy người dùng</p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
               {sessions.map(session => (
                 <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedSessionId === session.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-100'}`}
                 >
                    <div className="relative">
                      <img src={session.partner.avatar} alt={session.partner.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      {session.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50">
                          {session.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-semibold truncate ${selectedSessionId === session.id ? 'text-indigo-700' : 'text-slate-800'}`}>{session.partner.name}</h3>
                        <span className="text-[10px] text-slate-400">
                          {session.messages.length > 0 ? new Date(session.messages[session.messages.length - 1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${session.unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {session.isTyping ? 'Đang soạn tin...' : (session.lastMessage || 'Bắt đầu trò chuyện')}
                      </p>
                    </div>
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
        {activeSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedSessionId(null)} className="md:hidden text-slate-500 hover:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="relative">
                  <img src={activeSession.partner.avatar} alt="Partner" className="w-10 h-10 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{activeSession.partner.name}</h3>
                  <p className="text-xs text-green-600 font-medium">Đang hoạt động</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {activeSession.messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8">
                    <img src={activeSession.partner.avatar} className="w-20 h-20 rounded-full mb-4 grayscale opacity-50" alt="" />
                    <p>Chưa có tin nhắn nào. <br/>Hãy gửi lời chào tới {activeSession.partner.name}!</p>
                 </div>
              )}
              {activeSession.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!msg.isMe && (
                      <img src={activeSession.partner.avatar} className="w-8 h-8 rounded-full self-end mb-1" alt="Avatar" />
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        msg.isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="flex gap-2 max-w-[80%]">
                      <img src={activeSession.partner.avatar} className="w-8 h-8 rounded-full self-end mb-1" alt="Avatar" />
                      <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
              <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-500 border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-[-45deg] translate-x-0.5 -translate-y-0.5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-indigo-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Chọn một đoạn chat</h2>
            <p>Hoặc tìm kiếm bạn bè để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
