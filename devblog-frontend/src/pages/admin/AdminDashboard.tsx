import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Users, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchStats = async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
};

const AdminDashboard = () => {
    const { data: stats, isLoading, isError } = useQuery({ queryKey: ['adminStats'], queryFn: fetchStats });

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (isError) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100/60 font-medium">Failed to load statistics. Please check your connection.</div>;
    console.log(stats)
    const cards = [
        { label: 'Total Users', value: stats?.data?.totalUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/admin/users' },
        { label: 'Published Posts', value: stats?.data?.totalPosts || 0, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/admin/posts' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Platform Overview</h2>
                <p className="text-[14.5px] text-slate-500 font-medium">Review your global DevBlog statistics and content velocity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Link key={idx} to={card.path} className="group block">
                            <div className="bg-white p-6 rounded-[20px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05)] hover:border-indigo-100 transition-all flex items-center gap-5">
                                <div className={`p-4 ${card.bg} rounded-2xl ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-slate-500 tracking-wide uppercase mb-1">{card.label}</p>
                                    <h3 className="text-3xl font-extrabold text-slate-900">{card.value.toLocaleString()}</h3>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Action Simulation inside Dashboard */}
            <div className="mt-12">
                <h2 className="text-[18px] font-bold text-slate-900 mb-4">System Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-white rounded-[16px] shadow-sm border border-slate-200/80 hover:bg-slate-50 text-left transition-colors">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        <div>
                            <span className="block font-bold text-[14.5px] text-slate-800">Generate Report</span>
                            <span className="block text-[13px] text-slate-500 leading-tight">Export platform metrics to CSV</span>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-[16px] shadow-sm border border-slate-200/80 hover:bg-slate-50 text-left transition-colors">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        <div>
                            <span className="block font-bold text-[14.5px] text-slate-800">Global Announcement</span>
                            <span className="block text-[13px] text-slate-500 leading-tight">Broadcast message to all users</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
