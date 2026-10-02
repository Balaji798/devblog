import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';

const schema = z.object({
    email: z.string().email('Please enter a valid email address')
});

type ForgotForm = z.infer<typeof schema>;

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
        resolver: zodResolver(schema)
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: ForgotForm) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/forgot-password', data);
            setIsSuccess(true);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Failed to send reset link. Please try again later.');
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
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h2>
                    <p className="text-slate-500 mt-2 text-[15px] px-4">No worries, we'll send you reset instructions.</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13.5px] font-medium text-center">
                        {errorMsg}
                    </div>
                )}

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-5 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="font-bold text-[18px] text-slate-900">Check your email</h3>
                        <p className="text-center text-[14px] text-slate-500 leading-relaxed max-w-[280px]">
                            We sent a password reset link to your email address. It will expire in 15 minutes.
                        </p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full py-3 mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-[14px]"
                        >
                            Return to log in
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-[13.5px] font-bold text-slate-700">Email Address</label>
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-[#5A4AF4] hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'Send reset link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
