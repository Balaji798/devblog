import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../app/store';

import avatar1 from '../../assets/avatars/avatar-1.png';
import avatar2 from '../../assets/avatars/avatar-2.png';
import avatar3 from '../../assets/avatars/avatar-3.png';
import avatar4 from '../../assets/avatars/avatar-4.png';

export const CreatePostQuick = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const avatarUrl = avatar1;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">
            {/* Header: Avatar + Create a Post */}
            <div className="flex items-center gap-3 mb-4">
                <img
                    src={avatarUrl}
                    alt="Active User"
                    className="w-12 h-12 rounded-full object-cover bg-slate-100 shrink-0"
                />
                <div
                    onClick={() => navigate('/posts/new')}
                    className="w-full resize-none border border-slate-200/80 rounded-full bg-white p-3 text-[14px] text-bold text-slate-700 text-left shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] flex justify-between items-center cursor-text"
                >
                    <p className="opacity-70">{`What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}</p>
                    <button className="px-5 py-[5px] bg-[#5A4AF4] text-white text-[14.5px] font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm ml-2 cursor-pointer">
                        Create Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TrendingTopics = () => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-[14px]">Trending Topics</h3>
            <button className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700">View all</button>
        </div>
        <div className="space-y-3.5">
            {[
                { label: 'Web Development', count: '1.2K', color: 'text-pink-500', bg: 'bg-[#FCE7F3]' },
                { label: 'React', count: '856', color: 'text-sky-500', bg: 'bg-[#E0F2FE]' },
                { label: 'Career', count: '642', color: 'text-orange-500', bg: 'bg-[#FFEDD5]' },
                { label: 'AI & Tools', count: '538', color: 'text-teal-500', bg: 'bg-[#CCFBF1]' },
                { label: 'TypeScript', count: '512', color: 'text-blue-600', bg: 'bg-[#DBEAFE]' }
            ].map(t => (
                <div key={t.label} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[14px] ${t.bg} ${t.color}`}>#</span>
                        <span className="text-[13px] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{t.label}</span>
                    </div>
                    <span className="text-[12px] text-slate-400 whitespace-nowrap ml-2">{t.count} posts</span>
                </div>
            ))}
        </div>
    </div>
);

export const SuggestedPeople = () => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-[14px]">Suggested People</h3>
            <button className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700">View all</button>
        </div>
        <div className="space-y-4">
            {[
                { name: 'Rahul Sharma', role: 'Full Stack Developer', img: avatar2 },
                { name: 'Priya Mehta', role: 'Frontend Engineer', img: avatar3 },
                { name: 'Amit Kumar', role: 'DevOps Engineer', img: avatar4 },
                { name: 'Sneha Roy', role: 'Software Developer', img: avatar1 }
            ].map(p => (
                <div key={p.name} className="flex justify-between items-center">
                    <div className="flex gap-2.5 items-center overflow-hidden">
                        <img
                            src={p.img}
                            alt={p.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm bg-slate-100"
                        />
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{p.role}</p>
                        </div>
                    </div>
                    <button className="text-[12px] font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors shrink-0 ml-2">
                        Follow
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export const RecentBookmarks = () => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-[14px]">Recent Bookmarks</h3>
            <button className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700">View all</button>
        </div>
        <div className="space-y-4">
            {[
                { title: 'Complete Guide to TypeScript', time: '5 min read', color: 'from-blue-500 to-indigo-600' },
                { title: 'Building Real-time Apps with Socket.io', time: '8 min read', color: 'from-orange-500 to-red-600' }
            ].map(b => (
                <div key={b.title} className="flex gap-3 group cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${b.color} flex-shrink-0 opacity-90 group-hover:opacity-100 shadow-inner`} />
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{b.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{b.time}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
