/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { PostCard } from '../../components/post/PostCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { FileEdit, LayoutDashboard, Bookmark, Settings, BarChart2, ChevronDown, Eye, Heart, MessageCircle, ArrowUp, Clock, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const fetchMyPosts = async () => {
    // Ideally '/posts/me', but since backend doesn't explicitly have it, we pull all and filter
    // If backend has the query, great, otherwise fallback string array filter
    const { data } = await api.get('/posts');
    return data;
};

const Dashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data, isLoading } = useQuery({ queryKey: ['posts'], queryFn: fetchMyPosts });

    // Simulate user isolation (if API just returned all)
    const allPosts = data?.data?.posts || [];
    const myPosts = allPosts.filter((post: any) => post.author._id === user?.id || post.author.name === user?.data?.user?.name);
    console.log(user)
    const tabs = [
        { name: 'My Posts', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Drafts', path: '#', icon: FileEdit },
        { name: 'Saved', path: '/bookmarks', icon: Bookmark },
        { name: 'Settings', path: '#', icon: Settings },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            {/* Left Sidebar */}
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            {/* Config & Work Area */}
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 space-y-6">

                {/* Profile Admin Header */}
                <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 flex flex-col md:flex-row items-center gap-6">
                    <img
                        src="/assets/avatars/avatar-1.png"
                        alt="User"
                        className="w-24 h-24 rounded-full object-cover shadow-sm bg-slate-100 border border-slate-200/60"
                        onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random' }}
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                            {user?.name || 'Developer'}
                        </h2>
                        <p className="text-[14px] text-slate-500 mb-4">{user?.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="px-4 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                                <span className="block text-[16px] font-bold text-slate-800">{myPosts.length}</span>
                                <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide">Posts Published</span>
                            </div>
                            <div className="px-4 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                                <span className="block text-[16px] font-bold text-slate-800">4,281</span>
                                <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide">Subscribers</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/posts/new" className="hidden md:inline-flex px-6 py-2.5 bg-[#5A4AF4] text-white text-[14px] font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
                        Write a Post
                    </Link>
                </div>

                {/* Local Nav */}
                <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar gap-6">
                    {tabs.map(tab => (
                        <Link
                            key={tab.name}
                            to={tab.path}
                            className={`flex items-center gap-2 pb-3 pt-1 border-b-2 font-bold text-[14px] transition-colors whitespace-nowrap ${location.pathname === tab.path
                                ? 'border-[#5A4AF4] text-[#5A4AF4]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon className="w-[18px] h-[18px]" strokeWidth={location.pathname === tab.path ? 2.5 : 2} />
                            {tab.name}
                        </Link>
                    ))}
                </div>

                {/* Dashboard Results Render */}
                {isLoading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : myPosts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200/60 dashed-border">
                        <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No posts yet</h3>
                        <p className="text-slate-500 text-[14px] mb-6">You haven't written any articles yet.</p>
                        <Link to="/posts/new" className="px-6 py-2.5 bg-[#5A4AF4] text-white text-[14px] font-bold rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all">
                            Start Writing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myPosts.map((post: any) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            {/* Right Sidebar - Optional for Dashboard, but keeps balance */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
                {/* Quick Stats Card */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-slate-100/80">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-[#5A4AF4]" strokeWidth={2.5} />
                            <h3 className="font-extrabold text-slate-900 text-[16px] tracking-tight">Quick Stats</h3>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[12px] font-medium rounded-lg transition-colors">
                            Last 30 days
                            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="space-y-0 text-[14px]">
                        {/* Total Views */}
                        <div className="flex items-center justify-between py-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-5 h-5 text-blue-500" strokeWidth={2} />
                                </div>
                                <span className="font-semibold text-slate-700 text-[14px]">Total Views</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 text-[16px] leading-tight">12.5k</div>
                                <div className="flex items-center justify-end gap-0.5 text-green-500 text-[12px] font-bold mt-0.5">
                                    <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                                    <span>18%</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Likes */}
                        <div className="flex items-center justify-between py-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-5 h-5 text-rose-500" strokeWidth={2} />
                                </div>
                                <span className="font-semibold text-slate-700 text-[14px]">Total Likes</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 text-[16px] leading-tight">842</div>
                                <div className="flex items-center justify-end gap-0.5 text-green-500 text-[12px] font-bold mt-0.5">
                                    <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                                    <span>12%</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="flex items-center justify-between py-4 pt-4 pb-1">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-[#5A4AF4]" strokeWidth={2} />
                                </div>
                                <span className="font-semibold text-slate-700 text-[14px]">Comments</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 text-[16px] leading-tight">156</div>
                                <div className="flex items-center justify-end gap-0.5 text-green-500 text-[12px] font-bold mt-0.5">
                                    <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                                    <span>8%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-slate-100/80 mt-6 pt-7">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#5A4AF4]" strokeWidth={2.5} />
                            <h3 className="font-extrabold text-slate-900 text-[16px] tracking-tight">Recent Activity</h3>
                        </div>
                        <button className="flex items-center gap-1 text-[#5A4AF4] text-[13px] font-bold hover:text-indigo-600 transition-colors">
                            View all
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <img src="/assets/avatars/avatar-5.png" alt="Alex" className="w-11 h-11 rounded-full object-cover shadow-sm bg-slate-100 flex-shrink-0" />
                            <div>
                                <div className="text-[14px] text-slate-700 leading-snug">
                                    <span className="font-bold text-slate-900">Alex</span> commented on your post
                                </div>
                                <div className="text-[13px] font-medium text-slate-500 mt-0.5 line-clamp-1 italic">
                                    "React Server Components..."
                                </div>
                                <div className="text-[12px] font-semibold text-slate-400 mt-1.5">2 hours ago</div>
                            </div>
                        </div>

                        <div className="w-full border-t border-slate-100"></div>

                        <div className="flex gap-4 pb-1">
                            <img src="/assets/avatars/avatar-4.png" alt="Sarah" className="w-11 h-11 rounded-full object-cover shadow-sm bg-slate-100 flex-shrink-0" />
                            <div>
                                <div className="text-[14px] text-slate-700 leading-snug">
                                    <span className="font-bold text-slate-900">Sarah</span> liked your post
                                </div>
                                <div className="text-[13px] font-medium text-slate-500 mt-0.5 line-clamp-1 italic">
                                    "Building Scalable APIs..."
                                </div>
                                <div className="text-[12px] font-semibold text-slate-400 mt-1.5">5 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
