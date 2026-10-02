/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Link } from 'react-router-dom';

const fetchPosts = async () => {
    const { data } = await api.get('/admin/posts');
    return data.data.posts;
};

const AdminPosts = () => {
    const queryClient = useQueryClient();
    const { data: posts, isLoading } = useQuery({ queryKey: ['adminPosts'], queryFn: fetchPosts });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/posts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
        }
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Content Moderation</h2>
                <p className="text-[14.5px] text-slate-500 font-medium">Review and enforce community guidelines on published articles.</p>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Post Details</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {posts?.map((post: any) => (
                                <tr key={post._id} className={`hover:bg-slate-50/50 transition-colors group ${post.isDeleted ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/admin/posts/${post._id}`} className="block text-[14.5px] font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors truncate max-w-xs md:max-w-md">
                                            {post.title}
                                        </Link>
                                        <div className="text-[12px] font-medium text-slate-400 uppercase tracking-wide mt-1">
                                            {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-[14px] font-medium text-slate-700">{post.author?.name || 'Unknown User'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wide rounded-lg ${post.isDeleted ? 'bg-red-100/60 text-red-700' : 'bg-green-100/60 text-green-700'}`}>
                                            {post.isDeleted ? 'Deleted' : 'Live'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!post.isDeleted && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you certain you want to permanently delete this post?')) {
                                                        deleteMutation.mutate(post._id);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold rounded-lg transition-colors border border-red-100/50"
                                                disabled={deleteMutation.isPending}
                                            >
                                                Delete Post
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPosts;
