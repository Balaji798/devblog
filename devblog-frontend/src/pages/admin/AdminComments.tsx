/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

const fetchComments = async () => {
    const { data } = await api.get('/admin/comments');
    return data.data.comments;
};

const AdminComments = () => {
    const queryClient = useQueryClient();
    const { data: comments, isLoading } = useQuery({ queryKey: ['adminComments'], queryFn: fetchComments });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/comments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminComments'] });
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
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Comment Moderation</h2>
                <p className="text-[14.5px] text-slate-500 font-medium">Monitor and purge inappropriate discussions across the platform.</p>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider w-1/2">Comment Snippet</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {comments?.map((comment: any) => (
                                <tr key={comment._id} className={`hover:bg-slate-50/50 transition-colors group ${comment.isDeleted ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="text-[13.5px] font-medium text-slate-700 line-clamp-2 leading-relaxed">
                                            "{comment.content}"
                                        </div>
                                        <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mt-2">
                                            {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-[14px] font-bold text-slate-800 tracking-tight">{comment.author?.name || 'Unknown User'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wide rounded-lg ${comment.isDeleted ? 'bg-red-100/60 text-red-700' : 'bg-green-100/60 text-emerald-700'}`}>
                                            {comment.isDeleted ? 'Deleted' : 'Live'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!comment.isDeleted && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this comment permanently?')) {
                                                        deleteMutation.mutate(comment._id);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold rounded-lg transition-colors border border-red-100/50"
                                                disabled={deleteMutation.isPending}
                                            >
                                                Delete
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

export default AdminComments;
