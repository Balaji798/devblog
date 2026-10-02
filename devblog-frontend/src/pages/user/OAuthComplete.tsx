import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type EmailForm = z.infer<typeof emailSchema>;

const OAuthComplete = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>({
        resolver: zodResolver(emailSchema)
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // We expect the backend to pass ?tempToken=...&name=... during the redirect
    const tempToken = searchParams.get('tempToken');
    const name = searchParams.get('name') || 'there';

    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // If there is no tempToken, this page was accessed directly which is invalid
    if (!tempToken) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Invalid Session</h2>
                <p className="text-slate-500 mt-2">No OAuth temporary session found. Please return to the login page.</p>
                <button onClick={() => navigate('/login')} className="mt-6 px-6 py-2.5 bg-[#5A4AF4] text-white font-bold rounded-xl shadow-sm">Back to Login</button>
            </div>
        );
    }

    const onSubmit = async (data: EmailForm) => {
        setIsLoading(true);
        setAuthError('');
        try {
            const response = await api.post('/auth/facebook/complete', {
                tempToken,
                email: data.email
            });
            dispatch(setCredentials({
                user: response.data.data.user || response.data.data,
                accessToken: response.data.data.accessToken
            }));
            navigate('/dashboard');
        } catch (e: any) {
            setAuthError(e.response?.data?.error || 'Failed to complete OAuth linking.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-10">
                    <h1 className="text-[32px] font-extrabold text-[#1a1a1a] tracking-tight leading-tight mb-3">
                        Almost there!
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                        Hi {name}, Facebook didn't provide your email address. Please supply one to finalize your account setup.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-7 md:p-8 rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-100/60 pb-10">

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[13px] font-semibold text-red-600 leading-relaxed">{authError}</p>
                        </div>
                    )}

                    <div className="space-y-5 relative">
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-[#5A4AF4] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#5A4AF4]/20 focus:border-[#5A4AF4] focus:bg-white transition-all outline-none ${errors.email ? 'border-red-300 bg-red-50/50' : ''}`}
                                    placeholder="your@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-[12px] font-medium ml-1 mt-1">{errors.email.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm tracking-wide text-[14.5px] font-bold text-white bg-[#5A4AF4] hover:bg-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Complete Registration'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default OAuthComplete;
