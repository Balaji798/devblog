/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

const fetchUsers = async () => {
    const { data } = await api.get('/admin/users');
    return data.data.users;
};

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const { data: users, isLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: fetchUsers });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => api.patch(`/admin/users/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });
    console.log(users)
    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">User Management</h2>
                <p className="text-[14.5px] text-slate-500 font-medium">Review and manage platform member accounts and roles.</p>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-[12px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {users?.map((user: any) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-[14.5px] font-bold text-slate-900 tracking-tight">{user.name}</div>
                                        <div className="text-[13px] text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-[11px] uppercase tracking-wide font-bold rounded-lg ${user.role === 'ADMIN' ? 'bg-indigo-100/60 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-[11px] uppercase tracking-wide font-bold rounded-lg ${user.isActive ? 'bg-emerald-100/60 text-emerald-700' : 'bg-red-100/60 text-red-700'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateMutation.mutate({ id: user._id, updates: { isActive: !user.isActive } })}
                                                className="px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-lg transition-colors shadow-sm"
                                                disabled={updateMutation.isPending}
                                            >
                                                {user.isActive ? 'Ban User' : 'Unban'}
                                            </button>
                                            <button
                                                onClick={() => updateMutation.mutate({ id: user._id, updates: { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' } })}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[12px] font-bold rounded-lg transition-colors border border-indigo-100/50"
                                                disabled={updateMutation.isPending}
                                            >
                                                Toggle Role
                                            </button>
                                        </div>
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

export default AdminUsers;
