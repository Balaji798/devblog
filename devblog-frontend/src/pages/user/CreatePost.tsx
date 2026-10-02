import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LeftSidebar } from '../../components/layout/LeftSidebar';
import { Image, Link2, Hash } from 'lucide-react';

const postSchema = z.object({
    title: z.string().min(5, 'Title needs to be at least 5 characters').max(100),
    content: z.string().min(10, 'Content must be at least 10 characters')
});
type PostForm = z.infer<typeof postSchema>;

const CreatePost = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<PostForm>({
        resolver: zodResolver(postSchema)
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Ensure we start at top of page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const mutation = useMutation({
        mutationFn: (newPost: PostForm) => api.post('/posts', newPost),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            navigate('/');
        }
    });

    const onSubmit = (data: PostForm) => {
        mutation.mutate(data);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-20 sm:pt-6">
            {/* Left Sidebar */}
            <div className="hidden md:block md:col-span-3 xl:col-span-2">
                <LeftSidebar />
            </div>

            {/* Central Editor Area - Focused workspace, spans wider because no right sidebar */}
            <div className="col-span-1 md:col-span-9 lg:col-span-8 xl:col-span-7">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/60">
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight mb-6">Create a New Post</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[13.5px] font-bold text-slate-700">Article Title</label>
                            <input
                                {...register('title')}
                                type="text"
                                placeholder="E.g., Understanding React Hooks in 2024"
                                className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                            {errors.title && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13.5px] font-bold text-slate-700">Content Body</label>
                            <div className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden">
                                {/* Toolbar mockup to match design system complexity */}
                                <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                                        <b className="font-serif text-[15px]">B</b>
                                    </button>
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors italic">
                                        <i className="font-serif text-[15px]">I</i>
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                                        <Image className="w-[18px] h-[18px]" />
                                    </button>
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                                        <Link2 className="w-[18px] h-[18px]" />
                                    </button>
                                </div>
                                <textarea
                                    {...register('content')}
                                    rows={14}
                                    placeholder="Write your amazing post here... Markdown is supported."
                                    className="w-full bg-transparent px-4 py-4 text-[14px] text-slate-800 placeholder-slate-400 border-none outline-none resize-y"
                                />
                            </div>
                            {errors.content && <p className="text-red-500 text-[12px] font-medium ml-1">{errors.content.message}</p>}
                        </div>

                        {/* Tag simulation row */}
                        <div className="space-y-1.5">
                            <label className="block text-[13.5px] font-bold text-slate-700">Tags (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add up to 4 tags (comma separated)..."
                                    className="w-full rounded-[12px] border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-6 py-2.5 bg-[#5A4AF4] hover:bg-indigo-600 text-white text-[14px] font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Publishing...
                                    </>
                                ) : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
