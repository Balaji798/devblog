import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full max-w-[1600px] mx-auto py-6 sm:px-4 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;
