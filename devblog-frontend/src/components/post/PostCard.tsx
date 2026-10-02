/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heart, MessageSquare, Bookmark, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

import avatar1 from '../../assets/avatars/avatar-1.png';
import avatar2 from '../../assets/avatars/avatar-2.png';
import avatar3 from '../../assets/avatars/avatar-3.png';
import avatar4 from '../../assets/avatars/avatar-4.png';
const avatarArray = [avatar1, avatar2, avatar3, avatar4];

// Simple deterministic hash matching algorithm for purely stable UI
const getDeterministicValue = (str: string, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % max;
};

export const PostCard = ({ post }: { post: any }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Generate deterministic author avatar index (0 to 3)
    const authorName = post.author?.name || 'User';
    const avatarIndex = getDeterministicValue(authorName, 4);
    const authorAvatar = avatarArray[avatarIndex - 1];

    const fallbackImage = `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80`;
    const buzzwords = ['React', 'JavaScript', 'MERN', 'Node.js', 'Frontend', 'Best Practices', 'MongoDB', 'Cloud'];
    console.log(post)
    // Deterministic tags and counts based on post content hash
    const contentStr = post.content || '';
    const tag1 = buzzwords[getDeterministicValue(contentStr, buzzwords.length)];
    const tag2 = buzzwords[(getDeterministicValue(contentStr, buzzwords.length) + 2) % buzzwords.length];

    const likesCount = post.likes?.length || 0;
    const commentsCount = post.commentCount || 0;

    // Evaluate like status globally
    const userId = user?.id || (user as any)?._id || (user as any)?.data?.id;
    const hasLiked = Boolean(userId && post.likes?.includes(userId));

    const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today';

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                    <img
                        src={authorAvatar}
                        className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-50"
                        alt={authorName}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[14px] text-slate-900 leading-tight">{authorName}</h3>
                            {post.author?.role === 'ADMIN' && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-[12px] text-slate-500 mt-0.5">
                            {dateStr} • {Math.max(1, Math.ceil((contentStr.length || 100) / 1000))} min read
                        </p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-700 p-1">
                    <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                    </span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 order-2 sm:order-1 min-w-0">
                    <Link to={`/posts/${post.slug || post._id}`}>
                        <h2 className="text-[17px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {post.title}
                        </h2>
                    </Link>
                    <p className="text-slate-600 text-[13.5px] mb-4 line-clamp-3 leading-relaxed">
                        {contentStr}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 text-[11px] font-semibold rounded-full flex items-center">
                            <span className="text-sky-400 font-bold mr-1">#</span>{tag1}
                        </span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full flex items-center">
                            <span className="text-indigo-400 font-bold mr-1">#</span>{tag2}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 max-w-sm">
                        <button className={`flex items-center gap-1.5 transition-colors group/btn ${hasLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}>
                            <Heart className={`w-4 h-4 transition-colors ${hasLiked ? 'fill-red-500' : 'group-hover/btn:fill-red-500'}`} />
                            <span className="text-[12px] font-semibold">{likesCount}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group/btn">
                            <MessageSquare className="w-4 h-4 group-hover/btn:fill-indigo-600 transition-colors" />
                            <span className="text-[12px] font-semibold">{commentsCount}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                            <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                            <Share className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="w-full sm:w-48 h-40 sm:h-32 flex-shrink-0 order-1 sm:order-2 rounded-xl overflow-hidden bg-slate-100">
                    <img
                        src={fallbackImage}
                        alt="Post Cover"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            </div>
        </div>
    );
};
