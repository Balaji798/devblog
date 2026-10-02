/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../lib/axios';

import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { PostCard } from '../../components/post/PostCard';
import { TrendingTopics, SuggestedPeople } from '../../components/layout/RightSidebarComponents';
import { MapPin, Link as LinkIcon, Calendar, UserPlus } from 'lucide-react';

const fetchUserPosts = async (userId: string) => {
    // If backend doesn't have /users/:id/posts, we fetch all and filter client side
    const { data } = await api.get('/posts');
    const allPosts = data?.posts || data?.data?.posts || [];
    return allPosts.filter((p: any) => p.author._id === userId);
};

const Profile = () => {
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const { data: posts, isLoading } = useQuery({
        queryKey: ['userPosts', id],
        queryFn: () => fetchUserPosts(id as string),
        enabled: !!id
    });

    const userPosts = posts || [];

    // Fallback UI profile data since we don't have a /users/:id endpoint guaranteed
    const profileName = userPosts.length > 0 ? userPosts[0].author.name : 'Developer';

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 space-y-6">

                {/* Profile Cover & Header */}
                <div className="bg-white rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
                    <div className="w-full h-32 md:h-40 bg-gradient-to-r from-[#5A4AF4] to-indigo-400"></div>
                    <div className="px-6 md:px-8 pb-8 relative">
                        <div className="flex justify-between items-start">
                            <img
                                src="/assets/avatars/avatar-2.png"
                                alt={profileName}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-sm object-cover bg-slate-100 -mt-12 sm:-mt-14 relative z-10"
                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${profileName}&background=random` }}
                            />
                            <button className="mt-4 px-6 py-2 bg-[#5A4AF4] text-white text-[14px] font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Follow
                            </button>
                        </div>

                        <div className="mt-4">
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profileName}</h1>
                            <p className="text-slate-500 text-[15px] max-w-xl mt-2 leading-relaxed">
                                Full-stack engineer exploring the modern web. Passionate about React, Node.js, and building beautiful community tools.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-5 text-[14px] text-slate-600 font-medium">
                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> San Francisco, CA</div>
                                <div className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-slate-400" /> github.com/developer</div>
                                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Joined Sep 2023</div>
                            </div>

                            <div className="flex items-center gap-6 mt-6">
                                <div><span className="font-bold text-slate-900 text-[15px]">142</span> <span className="text-slate-500 text-[13px]">Following</span></div>
                                <div><span className="font-bold text-slate-900 text-[15px]">10.5k</span> <span className="text-slate-500 text-[13px]">Followers</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Feed */}
                <h3 className="font-bold text-slate-900 text-[16px] px-2 mb-2">Latest Publications</h3>

                {isLoading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : userPosts.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-[16px] border border-slate-100/60 shadow-sm text-slate-500 text-[14px]">
                        No posts published yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userPosts.map((post: any) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
                <TrendingTopics />
                <SuggestedPeople />
            </div>
        </div>
    );
};

export default Profile;
