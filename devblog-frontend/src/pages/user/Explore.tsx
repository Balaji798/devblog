import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { TrendingTopics, SuggestedPeople } from '../../components/layout/RightSidebarComponents';
import { PostCard } from '../../components/post/PostCard';
import { Search, Compass } from 'lucide-react';

const fetchPosts = async () => {
    const { data } = await api.get('/posts');
    return data;
};

const Explore = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data, isLoading, isError } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
    const posts = data?.data?.posts || [];

    // For demonstration, simply reversing posts to simulate "Explore" random discover feed
    const explorePosts = [...posts].reverse();

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            {/* Left Sidebar */}
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            {/* Central Feed */}
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 space-y-6">

                {/* Explore Search Header */}
                <div className="bg-white p-6 rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-1">
                        <Compass className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore the Community</h2>
                    <p className="text-slate-500 text-[14px] max-w-md">Discover top trending articles, discussions, and developers matching your personal interests.</p>

                    <div className="w-full max-w-lg mt-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search topics, tutorials, or posts..."
                            className="w-full rounded-[14px] border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                        />
                    </div>
                </div>

                {/* Popular Tags Segment */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {['#Programming', '#JavaScript', '#React', '#WebDesign', '#Career', '#OpenSource'].map(tag => (
                        <button key={tag} className="px-5 py-2 bg-white border border-slate-200/80 rounded-full text-[13px] font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm">
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Feed Rendering */}
                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Discovering content...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-medium">
                        Failed to explore posts. Please try refreshing.
                    </div>
                ) : explorePosts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 font-medium">
                        No content published yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {explorePosts.map((post: any) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-6">
                <TrendingTopics />
                <SuggestedPeople />
            </div>
        </div>
    );
};

export default Explore;
