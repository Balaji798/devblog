import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PenTool } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { NotificationDropdown } from './NotificationDropdown';
import avatarImg from '../../assets/avatars/avatar-1.png';

export const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    return (
        <header className="w-full bg-white border-b border-slate-200 fixed top-0 z-50 left-0">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[10px] bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
                            <PenTool className="w-5 h-5" />
                        </div>
                        <Link to="/" className="font-extrabold text-[22px] tracking-tight text-slate-900">
                            Dev<span className="text-indigo-600">Blog</span>
                        </Link>
                    </div>

                    {/* Search Bar - hidden on mobile */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search posts, topics or people..."
                            className="block w-full pl-10 pr-3 py-2 border-none rounded-2xl bg-slate-100 text-[13px] placeholder-slate-500 focus:ring-0 focus:bg-slate-200 transition-all outline-none"
                        />
                    </div>

                    {/* Right Nav */}
                    <div className="flex items-center gap-6">
                        <nav className="hidden sm:flex items-center gap-6 text-[14px] font-semibold">
                            <Link to="/" className={`pb-1 border-b-2 ${location.pathname === '/' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                                Home
                            </Link>
                            <Link to="/explore" className="text-slate-600 hover:text-slate-900 pb-1 border-b-2 border-transparent">
                                Explore
                            </Link>
                            <Link to="/posts/new" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 pb-1 border-b-2 border-transparent">
                                <PenTool className="w-4 h-4 stroke-[2.5]" /> Create
                            </Link>
                        </nav>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-5">
                                <NotificationDropdown />
                                <button className="flex items-center gap-2">
                                    <img
                                        src={avatarImg}
                                        alt="Avatar"
                                        className="w-[34px] h-[34px] rounded-full object-cover bg-slate-100 border border-slate-200 shadow-sm"
                                    />
                                    <span className="text-[14px] font-bold text-slate-800 hidden lg:block">{user?.name?.split(' ')[0] || 'User'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-[14px] font-semibold text-slate-700 hover:text-indigo-600">Login</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
