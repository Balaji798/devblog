/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import api from '../../lib/axios';
import { Trash2, Heart, MessageSquare, Share, Bookmark } from 'lucide-react';
import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { TrendingTopics, SuggestedPeople } from '../../components/layout/RightSidebarComponents';

import avatar1 from '../../assets/avatars/avatar-1.png';
import avatar2 from '../../assets/avatars/avatar-2.png';
import avatar3 from '../../assets/avatars/avatar-3.png';
import avatar4 from '../../assets/avatars/avatar-4.png';
const avatarArray = [avatar1, avatar2, avatar3, avatar4];

const getDeterministicValue = (str: string, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % max;
};

const fetchPost = async (id: string) => {
    const { data } = await api.get(`/posts/${id}`);
    return data;
};

const fetchComments = async (postId: string) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data.data.comments;
};

const SinglePost = () => {
    const { id } = useParams<{ id: string }>();
    const [commentContent, setCommentContent] = useState('');
    const queryClient = useQueryClient();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const { data: post, isLoading: postLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id as string),
        enabled: !!id,
    });

    const postId = post?.data?._id;

    const { data: comments, isLoading: commentsLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => fetchComments(postId as string),
        enabled: !!postId,
    });

    const commentMutation = useMutation({
        mutationFn: (newComment: { content: string }) => api.post(`/posts/${postId}/comments`, newComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            setCommentContent('');
        }
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
    });

    const likeMutation = useMutation({
        mutationFn: () => api.post(`/posts/${postId}/like`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        }
    });

    if (postLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            <div className="hidden md:block md:col-span-3 xl:col-span-2"><LeftSidebar /></div>
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 text-center py-20 bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading article...</p>
            </div>
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6"><TrendingTopics /><SuggestedPeople /></div>
        </div>
    );
    if (!post) return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            <div className="hidden md:block md:col-span-3 xl:col-span-2"><LeftSidebar /></div>
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 text-center py-20 bg-red-50 rounded-2xl border border-red-100/60 font-medium text-red-600">
                Post not found.
            </div>
        </div>
    );

    const authorAvatarIndex = post?.data?.author?.avatarIndex ?? getDeterministicValue(post.data?.author?.name || 'User', 4);
    const authorAvatar = avatarArray[authorAvatarIndex - 1] || avatarArray[0];

    const userId = user?.id || (user as any)?._id || (user as any)?.data?.id;
    const likesCount = post.data?.likes?.length || 0;
    const hasLiked = Boolean(userId && post.data?.likes?.includes(userId));
    console.log(post.data?.likes, user)
    const fallbackCover = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80`;
    console.log(authorAvatarIndex)
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            {/* Left Sidebar */}
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            {/* Central Article Area */}
            <div className="col-span-1 md:col-span-9 lg:col-span-7 xl:col-span-7 space-y-6">

                {/* Main Article Container */}
                <article className="bg-white rounded-[16px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100/80 overflow-hidden">
                    <div className="w-full h-[240px] md:h-[320px] overflow-hidden bg-slate-100 relative">
                        <img
                            src={fallbackCover}
                            className="w-full h-full object-cover"
                            alt="Article Cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>

                    <div className="p-6 md:p-8 lg:p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                src={authorAvatar}
                                className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200/60 shadow-sm"
                                alt={post.data.author?.name || 'Unknown Author'}
                            />
                            <div>
                                <h4 className="font-bold text-[15px] text-slate-900 leading-tight text-left">
                                    {post.data.author?.name || 'Unknown Author'}
                                </h4>
                                <p className="text-[13px] text-slate-500 mt-0.5">
                                    {new Date(post.data.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    <span className="mx-2">•</span>
                                    {Math.max(1, Math.ceil((post.content?.length || 100) / 1000))} min read
                                </p>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        <div className="prose prose-slate max-w-none text-[16px] leading-relaxed text-slate-700 space-y-6 text-left">
                            {post?.data?.content?.split('\n').map((para: string, i: number) => (
                                para.trim() ? <p key={i}>{para}</p> : null
                            ))}
                        </div>

                        {/* Article Action Footer */}
                        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => { if (user) likeMutation.mutate(); else alert("Please log in to like this post"); }}
                                    disabled={likeMutation.isPending}
                                    className={`flex items-center gap-2 group ${likeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasLiked ? 'bg-red-50' : 'bg-slate-50 group-hover:bg-red-50'}`}>
                                        <Heart className={`w-5 h-5 transition-colors ${hasLiked ? 'fill-red-500 text-red-500' : 'text-slate-500 group-hover:fill-red-500 group-hover:text-red-500'}`} />
                                    </div>
                                    <span className={`font-semibold text-[14px] ${hasLiked ? 'text-red-600' : 'text-slate-600'}`}>{likesCount}</span>
                                </button>
                                <button className="flex items-center gap-2 group" onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <MessageSquare className="w-5 h-5 text-slate-500 group-hover:fill-indigo-600 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <span className="font-semibold text-slate-600 text-[14px]">{comments?.length || 0}</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                    <Bookmark className="w-4 h-4 text-slate-600" />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                    <Share className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60" id="comments">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Discussion ({comments?.length || 0})</h2>

                    {user ? (
                        <div className="flex gap-4 mb-10">
                            <img src={avatar1} className="w-10 h-10 rounded-full bg-slate-100 hidden sm:block shrink-0" alt="Current User" />
                            <form
                                onSubmit={(e) => { e.preventDefault(); if (commentContent.trim()) commentMutation.mutate({ content: commentContent }); }}
                                className="flex-1"
                            >
                                <div className="w-full rounded-[14px] border border-slate-200/80 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden mb-3">
                                    <textarea
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Add to the discussion..."
                                        rows={3}
                                        className="w-full bg-transparent px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 border-none outline-none resize-y"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={commentMutation.isPending || !commentContent.trim()}
                                        className="px-5 py-2 bg-[#5A4AF4] text-white rounded-xl text-[13.5px] font-bold hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Comment
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="mb-10 p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <p className="text-slate-600 text-[14px] font-medium">Log in to participate in this discussion.</p>
                            <Link to="/login" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-[13px] hover:bg-slate-50 transition-colors">
                                Log In
                            </Link>
                        </div>
                    )}

                    {commentsLoading ? (
                        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : comments?.length === 0 ? (
                        <p className="text-slate-500 text-center py-6 text-[14px]">No comments yet. Start the conversation!</p>
                    ) : (
                        <div className="space-y-6">
                            {comments?.map((comment: any) => {
                                const cAvatarIndex = comment?.author?.avatarIndex ?? getDeterministicValue(comment?.author?.name || 'User', 4);
                                return (
                                    <div key={comment._id} className="flex gap-4 group">
                                        <img
                                            src={avatarArray[cAvatarIndex - 1]}
                                            className="w-10 h-10 rounded-full bg-slate-100 shrink-0"
                                            alt={comment?.author?.name}
                                        />
                                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100/60">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[14px] text-slate-900 tracking-tight">{comment?.author?.name}</span>
                                                    <span className="text-[12px] text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                {(user?.id === comment?.author?._id || user?.role === 'ADMIN') && (
                                                    <button
                                                        onClick={() => deleteCommentMutation.mutate(comment._id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-md shadow-sm border border-slate-100"
                                                        title="Delete Comment"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[14px] text-slate-700 leading-relaxed break-words text-left">{comment.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-6">
                <TrendingTopics />
                <SuggestedPeople />
            </div>
        </div>
    );
};

export default SinglePost;
