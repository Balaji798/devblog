import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import api from '../lib/axios';
import { BookOpen, Users, FileText, LogOut, Home } from 'lucide-react';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        dispatch(logoutUser());
        window.location.href = '/';
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: Home },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Posts', path: '/admin/posts', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <div className="w-[280px] bg-white border-r border-slate-200/80 flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
                <div className="h-20 flex items-center px-8 border-b border-slate-100 gap-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900">DevBlog Admin</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1.5">
                    <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Management</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold text-[14px] ${isActive ? 'bg-[#5A4AF4] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <Link to="/" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 mb-2 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-bold text-[14px] transition-colors">
                        <Home className="h-5 w-5 text-slate-400" /> Return to App
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-500 hover:text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-50 font-bold text-[14px] transition-colors text-left">
                        <LogOut className="h-5 w-5 opacity-80" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto flex flex-col h-screen relative">
                <header className="bg-white/80 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-slate-100 h-20 flex items-center px-8 lg:px-12 sticky top-0 z-20 shrink-0">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {navItems.find(n => n.path === location.pathname)?.name || 'Admin'}
                    </h1>
                </header>
                <main className="p-8 lg:p-12 w-full max-w-[1400px] mx-auto flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
