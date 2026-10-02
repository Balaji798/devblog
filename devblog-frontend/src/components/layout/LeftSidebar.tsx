import React from 'react';
import { Home, Compass, PlusSquare, FileText, Bookmark, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import type { RootState } from '../../app/store';
import api from '../../lib/axios';

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: PlusSquare, label: 'Create Post', path: '/posts/new' },
    { icon: FileText, label: 'My Posts', path: '/dashboard' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: '/profile' }
];

const topics = [
    { id: 'all', label: 'All Topics', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'web', label: 'Web Development', color: 'text-pink-500' },
    { id: 'js', label: 'JavaScript', color: 'text-yellow-500' },
    { id: 'react', label: 'React', color: 'text-sky-500' },
    { id: 'node', label: 'Node.js', color: 'text-green-500' },
    { id: 'ts', label: 'TypeScript', color: 'text-blue-600' },
    { id: 'devops', label: 'DevOps', color: 'text-purple-500' },
    { id: 'career', label: 'Career', color: 'text-orange-500' },
    { id: 'ai', label: 'AI & Tools', color: 'text-teal-500' },
    { id: 'os', label: 'Open Source', color: 'text-slate-500' },
];

export const LeftSidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed on backend:', e);
        }
        dispatch(logoutUser());
        window.location.href = '/';
    };

    return (
        <div className="sticky top-24 w-full h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-6 hidden md:block">
            {/* Primary Nav */}
            <nav className="space-y-1 mb-8">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Topics */}
            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Topics
            </div>
            <nav className="space-y-1">
                {topics.map((topic) => (
                    <button
                        key={topic.id}
                        className={`w-full flex justify-left items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${topic.bg ? topic.bg : 'hover:bg-slate-100'} ${topic.bg ? 'text-indigo-700' : 'text-slate-700'}`}
                    >
                        <span className={`text-lg font-bold leading-none text-left ${topic.color}`}>#</span>
                        {topic.label}
                    </button>
                ))}
            </nav>

            {isAuthenticated && (
                <>
                    <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-8">
                        Session
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-[13.5px] text-slate-500 hover:bg-red-50/80 hover:text-red-500 cursor-pointer"
                    >
                        <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2.5} />
                        <span>Log Out securely</span>
                    </button>
                </>
            )}
        </div>
    );
};
