/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Lock } from 'lucide-react';
import api from '../../lib/axios';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

type ForgotForm = z.infer<typeof schema>;

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
        resolver: zodResolver(schema)
    });

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: ForgotForm) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/reset-password', {
                email: data.email,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
            alert("Password forcefully overwritten successfully!");
            navigate('/login');
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Failed to overwrite password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-20 px-4 pt-32 sm:pt-24">
            <div className="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="flex flex-col items-center mb-8 text-center mt-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Direct Override</h2>
                    <p className="text-slate-500 mt-2 text-[15px] px-4">Bypass token verification via core email routing.</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13.5px] font-medium text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-[13.5px] font-bold text-slate-700 text-left">Target Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-[18px] w-[18px] text-slate-400" />
                            </div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13.5px] font-bold text-slate-700 text-left">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-[18px] w-[18px] text-slate-400" />
                            </div>
                            <input
                                {...register('newPassword')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13.5px] font-bold text-slate-700 text-left">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-[18px] w-[18px] text-slate-400" />
                            </div>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-[#5A4AF4] hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
