/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof schema>;

const ResetPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
        resolver: zodResolver(schema)
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: ResetForm) => {
        if (!token) {
            setErrorMsg("Missing or invalid reset token.");
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword: data.password
            });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login', { state: { message: "Password updated successfully. Please log in." } });
            }, 3000);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Failed to reset password. Token might be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-20 px-4 pt-32 sm:pt-24">
            <div className="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-5 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="font-bold text-[20px] text-slate-900">Password Reset!</h3>
                        <p className="text-center text-[14px] text-slate-500 leading-relaxed font-medium">
                            Your password has been changed securely. You are being redirected to log in...
                        </p>
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-4"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center mb-8 text-center pt-2">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set new password</h2>
                            <p className="text-slate-500 mt-2 text-[15px] px-2">Must be at least 6 characters.</p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13.5px] font-medium text-center">
                                {errorMsg}
                            </div>
                        )}

                        {!token && !errorMsg ? (
                            <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 text-[13.5px] font-medium text-center">
                                Invalid URL: Missing reset token in query string.
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[13.5px] font-bold text-slate-700">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-[18px] w-[18px] text-slate-400" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[13.5px] font-bold text-slate-700">Confirm new password</label>
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
                                disabled={isLoading || !token}
                                className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-[#5A4AF4] hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Reset password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
