/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLogin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setAuthError('');
        try {
            const response = await api.post('/auth/login', data);

            // Critical Admin Role validation block on the client side before allowing entry!
            const rawUser = response.data?.user || response.data?.data?.user || response.data;
            if (!rawUser || rawUser.role !== 'ADMIN') {
                setAuthError('Unauthorized: Only administrators can access this terminal.');
                setIsLoading(false);
                return;
            }

            dispatch(setCredentials({
                user: response.data.user || response.data,
                accessToken: response.data.accessToken || (response.data as any).data?.accessToken
            }));
            navigate('/admin');
        } catch (error: any) {
            setAuthError(error.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center flex-col items-center py-20 px-4 min-h-screen bg-slate-950 border-none relative">

            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold text-[14px]">
                <ArrowLeft className="w-4 h-4" /> Go back to consumer portal
            </Link>

            <div className="w-full max-w-[440px] bg-slate-900 p-8 md:p-10 rounded-[20px] shadow-2xl border border-slate-800">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-slate-950/50 rounded-2xl flex items-center justify-center mb-5 border border-slate-800/50">
                        <ShieldAlert className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Terminal</h2>
                    <p className="text-slate-400 mt-2 text-[15px]">Restricted access portal</p>
                </div>

                {authError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[13.5px] font-medium text-center">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-[13.5px] font-bold text-slate-300">Admin Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-[18px] w-[18px] text-slate-500" />
                            </div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="sysadmin@example.com"
                                className="w-full rounded-[12px] border border-slate-700 bg-slate-950/50 pl-10 pr-4 py-3 text-[14px] text-white placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-[12px] font-medium ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="block text-[13.5px] font-bold text-slate-300">Terminal Password</label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-[18px] w-[18px] text-slate-500" />
                            </div>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-[12px] border border-slate-700 bg-slate-950/50 pl-10 pr-4 py-3 text-[14px] text-white placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        {errors.password && <p className="text-red-400 text-[12px] font-medium ml-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Authorize Entry'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                    <p className="text-[12px] text-slate-500 font-medium">Activity is heavily monitored and recorded.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
