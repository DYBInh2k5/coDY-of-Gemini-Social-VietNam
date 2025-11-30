import React from 'react';
import { Notification } from '../types';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    actor: { id: 'u1', name: 'Minh Anh', handle: '@minhanh', avatar: 'https://picsum.photos/seed/minhanh/200/200' },
    content: 'đã thích bài viết của bạn.',
    timestamp: '2 phút trước',
    read: false,
    targetPostId: 'p1'
  },
  {
    id: '2',
    type: 'comment',
    actor: { id: 'u2', name: 'Tuấn Tech', handle: '@tuantech', avatar: 'https://picsum.photos/seed/tech/200/200' },
    content: 'đã bình luận: "Bài viết chất lượng quá bro! 🔥"',
    timestamp: '15 phút trước',
    read: false,
    targetPostId: 'p2'
  },
  {
    id: '3',
    type: 'follow',
    actor: { id: 'u3', name: 'Lan Ẩm Thực', handle: '@lanfoodie', avatar: 'https://picsum.photos/seed/food/200/200' },
    content: 'đã bắt đầu theo dõi bạn.',
    timestamp: '1 giờ trước',
    read: true
  },
  {
    id: '4',
    type: 'like',
    actor: { id: 'u4', name: 'Hùng Gym', handle: '@hunggym', avatar: 'https://picsum.photos/seed/gym/200/200' },
    content: 'đã thích ảnh của bạn.',
    timestamp: '3 giờ trước',
    read: true,
    targetPostId: 'p3'
  },
  {
    id: '5',
    type: 'comment',
    actor: { id: 'u5', name: 'Mai Vi Vu', handle: '@maitravel', avatar: 'https://picsum.photos/seed/travel/200/200' },
    content: 'đã nhắc đến bạn trong một bình luận.',
    timestamp: '1 ngày trước',
    read: true
  }
];

const Notifications: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Thông báo</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Đánh dấu đã đọc</button>
      </div>
      
      <div className="divide-y divide-slate-50">
        {MOCK_NOTIFICATIONS.map(notif => (
          <div key={notif.id} className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/40' : ''}`}>
            <div className="relative">
              <img src={notif.actor.avatar} alt={notif.actor.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs
                ${notif.type === 'like' ? 'bg-rose-500' : notif.type === 'comment' ? 'bg-blue-500' : 'bg-indigo-500'}
              `}>
                {notif.type === 'like' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                )}
                {notif.type === 'comment' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                  </svg>
                )}
                {notif.type === 'follow' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM2.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM18.75 7.5a.75.75 0 00-1.5 0v2.25H15a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H21a.75.75 0 000-1.5h-2.25V7.5z" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-slate-800 text-sm leading-relaxed">
                <span className="font-bold hover:underline cursor-pointer">{notif.actor.name}</span> {notif.content}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{notif.timestamp}</p>
            </div>

            {!notif.read && (
              <div className="flex items-center">
                 <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;