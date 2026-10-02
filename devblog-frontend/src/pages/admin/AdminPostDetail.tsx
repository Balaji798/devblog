/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Trash2, ArrowLeft } from 'lucide-react';

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
    const { data } = await api.get(`/admin/posts/${id}`);
    return data;
};

const fetchComments = async (postId: string) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data.data.comments;
};

const AdminPostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

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

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
    });

    if (postLoading) return (
        <div className="w-full text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading article details...</p>
        </div>
    );

    if (!post) return (
        <div className="w-full text-center py-20 bg-red-50 rounded-2xl border border-red-100 font-medium text-red-600">
            Post not found or previously deleted.
        </div>
    );

    const authorAvatarIndex = post?.data?.author?.avatarIndex ?? getDeterministicValue(post.data?.author?.name || 'User', 4);
    const authorAvatar = avatarArray[authorAvatarIndex - 1] || avatarArray[0];
    const fallbackCover = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80`;
    console.log(post)
    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            <Link to="/admin/posts" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-[14px] transition-colors mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to All Posts
            </Link>

            <article className="bg-white rounded-[16px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100/80 overflow-hidden">
                <div className="w-full h-[240px] md:h-[320px] overflow-hidden bg-slate-100 relative">
                    <img src={fallbackCover} className="w-full h-full object-cover" alt="Article Cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                <div className="p-6 md:p-8 lg:p-10">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={authorAvatar} className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200/60 shadow-sm" alt={post.data.author?.name || 'Unknown Author'} />
                        <div>
                            <h4 className="font-bold text-[15px] text-slate-900 leading-tight text-left">{post.data.author?.name || 'Unknown Author'}</h4>
                            <p className="text-[13px] text-slate-500 mt-0.5">
                                {new Date(post.data.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">{post.title}</h1>

                    <div className="prose prose-slate max-w-none text-[16px] leading-relaxed text-slate-700 space-y-6 text-left">
                        {post?.data?.content?.split('\n').map((para: string, i: number) => (
                            para.trim() ? <p key={i}>{para}</p> : null
                        ))}
                    </div>
                </div>
            </article>

            {/* Comments Moderation Panel */}
            <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">
                <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Community Discussion ({comments?.length || 0})</h2>

                {commentsLoading ? (
                    <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : comments?.length === 0 ? (
                    <p className="text-slate-500 text-center py-6 text-[14px]">No comments have been posted on this article.</p>
                ) : (
                    <div className="space-y-6">
                        {comments?.map((comment: any) => {
                            const cAvatarIndex = comment?.author?.avatarIndex ?? getDeterministicValue(comment?.author?.name || 'User', 4);
                            return (
                                <div key={comment._id} className="flex gap-4 group">
                                    <img src={avatarArray[cAvatarIndex - 1]} className="w-10 h-10 rounded-full bg-slate-100 shrink-0" alt={comment?.author?.name} />
                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100/60">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[14px] text-slate-900 tracking-tight">{comment?.author?.name}</span>
                                                <span className="text-[12px] text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this comment permanently?')) {
                                                        deleteCommentMutation.mutate(comment._id);
                                                    }
                                                }}
                                                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-md shadow-sm border border-slate-100"
                                                title="Drop Comment"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
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
    );
};

export default AdminPostDetail;
