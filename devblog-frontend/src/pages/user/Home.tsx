/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { CreatePostQuick, TrendingTopics, SuggestedPeople, RecentBookmarks } from '../../components/layout/RightSidebarComponents';
import { HeroBanner, FeedTabs } from '../../components/home/HeroBanner';
import { PostCard } from '../../components/post/PostCard';

const fetchPosts = async () => {
    const { data } = await api.get('/posts');
    return data;
};

const Home = () => {
    const { data, isLoading, isError } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

    const posts = data?.data?.posts || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            {/* Left Sidebar - Hidden on mobile, takes 3 cols on medium */}
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            {/* Central Feed - takes 9 on medium, 7 on large */}
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 space-y-6">
                <HeroBanner />
                <CreatePostQuick />
                <FeedTabs />

                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Loading your feed...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-medium">
                        Failed to load posts. Please try refreshing.
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 font-medium">
                        Feed is empty. Start writing!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post: any) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            {/* Right Sidebar - Hidden on smaller screens, takes 3 cols on large */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
                <TrendingTopics />
                <SuggestedPeople />
                <RecentBookmarks />
            </div>
        </div>
    );
};

export default Home;
