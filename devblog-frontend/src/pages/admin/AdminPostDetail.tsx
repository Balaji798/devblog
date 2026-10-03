/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import {
    Trash2,
    ArrowLeft,
    Pencil,
    Save,
    X,
} from 'lucide-react';

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

// Fetch post details
const fetchPost = async (id: string) => {
    const { data } = await api.get(`/admin/posts/${id}`);
    return data;
};

// Fetch post comments
const fetchComments = async (postId: string) => {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data.data.comments;
};

const AdminPostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Fetch post
    const {
        data: post,
        isLoading: postLoading,
        isError: postError,
    } = useQuery({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id as string),
        enabled: !!id,
    });

    const postData = post?.data;
    const postId = postData?._id;

    // Keep edit fields synchronized with fetched post
    useEffect(() => {
        if (postData) {
            setEditTitle(postData.title || '');
            setEditContent(postData.content || '');
        }
    }, [postData]);

    // Fetch comments
    const {
        data: comments,
        isLoading: commentsLoading,
    } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => fetchComments(postId as string),
        enabled: !!postId,
    });

    // Update post mutation
    const updatePostMutation = useMutation({
        mutationFn: async (payload: {
            title: string;
            content: string;
        }) => {
            const { data } = await api.patch(
                `/admin/posts/${id}`,
                payload
            );

            return data;
        },

        onSuccess: async () => {
            setIsEditing(false);
            setUpdateError('');

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['post', id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['adminPosts'],
                }),
            ]);
        },

        onError: (error: any) => {
            setUpdateError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Unable to update this post. Please try again.'
            );
        },
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) =>
            api.delete(`/comments/${commentId}`),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            });
        },
    });

    // Start editing
    const handleEdit = () => {
        setEditTitle(postData?.title || '');
        setEditContent(postData?.content || '');
        setUpdateError('');
        setIsEditing(true);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditTitle(postData?.title || '');
        setEditContent(postData?.content || '');
        setUpdateError('');
        setIsEditing(false);
    };

    // Save post
    const handleUpdatePost = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!editTitle.trim()) {
            setUpdateError('Post title is required.');
            return;
        }

        if (!editContent.trim()) {
            setUpdateError('Post content is required.');
            return;
        }

        updatePostMutation.mutate({
            title: editTitle.trim(),
            content: editContent.trim(),
        });
    };

    if (postLoading) {
        return (
            <div className="w-full text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                    Loading article details...
                </p>
            </div>
        );
    }

    if (postError || !post || !postData) {
        return (
            <div className="w-full text-center py-20 bg-red-50 rounded-2xl border border-red-100 font-medium text-red-600">
                Post not found or previously deleted.
            </div>
        );
    }

    const authorName = postData.author?.name || 'Unknown Author';

    const authorAvatarIndex =
        postData.author?.avatarIndex ??
        getDeterministicValue(authorName, 4);

    const authorAvatar =
        avatarArray[authorAvatarIndex - 1] || avatarArray[0];

    const fallbackCover =
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';

    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">

            {/* Back button */}
            <Link
                to="/admin/posts"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-[14px] transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to All Posts
            </Link>

            {/* Post details */}
            <article className="bg-white rounded-[16px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100/80 overflow-hidden">

                {/* Cover image */}
                <div className="w-full h-[240px] md:h-[320px] overflow-hidden bg-slate-100 relative">
                    <img
                        src={fallbackCover}
                        className="w-full h-full object-cover"
                        alt="Article Cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-6 md:p-8 lg:p-10">

                    {/* Author information */}
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={authorAvatar}
                            className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200/60 shadow-sm"
                            alt={authorName}
                        />

                        <div>
                            <h4 className="font-bold text-[15px] text-slate-900 leading-tight text-left">
                                {authorName}
                            </h4>

                            <p className="text-[13px] text-slate-500 mt-0.5">
                                {new Date(
                                    postData.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Edit and View section */}
                    {isEditing ? (
                        <form
                            onSubmit={handleUpdatePost}
                            className="space-y-6"
                        >
                            {/* Title input */}
                            <div>
                                <label
                                    htmlFor="post-title"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Post Title
                                </label>

                                <input
                                    id="post-title"
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    placeholder="Enter post title"
                                    maxLength={200}
                                    required
                                    className="w-full px-4 py-3 text-xl font-bold text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            {/* Content input */}
                            <div>
                                <label
                                    htmlFor="post-content"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Post Content
                                </label>

                                <textarea
                                    id="post-content"
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    placeholder="Write your post content..."
                                    rows={16}
                                    required
                                    className="w-full px-4 py-4 text-[15px] leading-relaxed text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-y"
                                />
                            </div>

                            {/* Error message */}
                            {updateError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                                    {updateError}
                                </div>
                            )}

                            {/* Form actions */}
                            <div className="flex flex-wrap justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={updatePostMutation.isPending}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updatePostMutation.isPending}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                >
                                    {updatePostMutation.isPending ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* View mode header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">

                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                    {postData.title}
                                </h1>

                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Post
                                </button>
                            </div>

                            {/* Post content */}
                            <div className="prose prose-slate max-w-none text-[16px] leading-relaxed text-slate-700 space-y-6 text-left">
                                {postData.content
                                    ?.split('\n')
                                    .map((para: string, i: number) =>
                                        para.trim() ? (
                                            <p key={i}>{para}</p>
                                        ) : null
                                    )}
                            </div>
                        </>
                    )}
                </div>
            </article>

            {/* Comments Moderation Panel */}
            <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">

                <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
                    Community Discussion ({comments?.length || 0})
                </h2>

                {commentsLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : comments?.length === 0 ? (
                    <p className="text-slate-500 text-center py-6 text-[14px]">
                        No comments have been posted on this article.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {comments?.map((comment: any) => {
                            const cAvatarIndex =
                                comment?.author?.avatarIndex ??
                                getDeterministicValue(
                                    comment?.author?.name || 'User',
                                    4
                                );

                            const commentAvatar =
                                avatarArray[cAvatarIndex - 1] ||
                                avatarArray[0];

                            return (
                                <div
                                    key={comment._id}
                                    className="flex gap-4 group"
                                >
                                    <img
                                        src={commentAvatar}
                                        className="w-10 h-10 rounded-full bg-slate-100 shrink-0 object-cover"
                                        alt={comment?.author?.name || 'User'}
                                    />

                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100/60">

                                        <div className="flex justify-between items-start mb-2">

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-[14px] text-slate-900 tracking-tight">
                                                    {comment?.author?.name || 'Unknown User'}
                                                </span>

                                                <span className="text-[12px] text-slate-400 font-medium">
                                                    {new Date(
                                                        comment.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Delete this comment permanently?'
                                                        )
                                                    ) {
                                                        deleteCommentMutation.mutate(
                                                            comment._id
                                                        );
                                                    }
                                                }}
                                                disabled={deleteCommentMutation.isPending}
                                                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-md shadow-sm border border-slate-100 disabled:opacity-50"
                                                title="Delete Comment"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <p className="text-[14px] text-slate-700 leading-relaxed break-words text-left">
                                            {comment.content}
                                        </p>
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
