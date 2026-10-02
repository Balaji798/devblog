/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useEffect } from 'react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token) {
            const fetchOAuthUser = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    dispatch(setCredentials({
                        user: response.data.user || response.data,
                        accessToken: token
                    }));
                    navigate('/dashboard');
                } catch {
                    setAuthError('OAuth authentication failed. Provider authorization was revoked or expired.');
                    setIsLoading(false);
                }
            };
            fetchOAuthUser();
        }
    }, [token, dispatch, navigate]);

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setAuthError('');
        try {
            const response = await api.post('/auth/login', data);
            dispatch(setCredentials({
                user: response.data.user || response.data,
                accessToken: response.data.accessToken || (response.data as any).data?.accessToken
            }));
            navigate('/dashboard');
        } catch (error: any) {
            setAuthError(error.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-20 px-4 pt-32 sm:pt-20">
            <div className="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <LogIn className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 mt-2 text-[15px]">Log in to your account to continue</p>
                </div>

                {authError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13.5px] font-medium text-center">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="block text-[13.5px] font-bold text-slate-700">Password</label>
                            <Link to="/forgot-password" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-[#5A4AF4] hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Sign in securely'}
                    </button>

                    <div className="relative !my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[13px]">
                            <span className="bg-white px-4 text-slate-500 font-bold uppercase tracking-wider text-[11px]">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer opacity-90 hover:opacity-100"
                        >
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                            <span className="text-[13.5px] font-bold text-slate-700">Google</span>
                        </a>
                        <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/facebook`}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-all shadow-sm cursor-pointer"
                        >
                            <svg className="w-[18px] h-[18px] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            <span className="text-[13.5px] font-bold text-[#1877F2]">Facebook</span>
                        </a>
                    </div>
                </form>

                <p className="mt-8 text-center text-[14px] text-slate-600 font-medium">
                    Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 ml-1">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
