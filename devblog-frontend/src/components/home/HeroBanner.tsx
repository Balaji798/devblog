import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import bannerImg from '../../assets/banner.png';

export const HeroBanner = () => {
    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden shadow-md bg-cover bg-center bg-no-repeat h-[250px] py-4 px-8"
            style={{ backgroundImage: `url(${bannerImg})` }}
        >
            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-slate-900/10" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 text-left max-w-sm">
                    <h3 className="text-white text-sm font-bold tracking-widest uppercase mb-1 opacity-90">Welcome to</h3>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
                        DevBlog
                    </h1>
                    <p className="max-w-[300px] text-gray-100 text-xs sm:text-xs mb-6 leading-relaxed font-medium drop-shadow-md">
                        A community for developers to share knowledge, ideas and grow together.
                    </p>
                    <Link to="/posts/new" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all mt-4">
                        Start Writing <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const FeedTabs = () => {
    const [active, setActive] = useState('For You');
    const tabs = ['For You', 'Latest', 'Trending', 'Following'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    className={`relative px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors outline-none
                    ${active === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {tab}
                    {active === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />
                    )}
                </button>
            ))}
        </div>
    );
};
