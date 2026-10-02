import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/user/Home';
import Login from '../pages/user/Login';
import Register from '../pages/user/Register';
import CreatePost from '../pages/user/CreatePost';
import SinglePost from '../pages/user/SinglePost';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPosts from '../pages/admin/AdminPosts';
import AdminPostDetail from '../pages/admin/AdminPostDetail';
import Explore from '../pages/user/Explore';
import Dashboard from '../pages/user/Dashboard';
import Profile from '../pages/user/Profile';
import ForgotPassword from '../pages/user/ForgotPassword';
import ResetPassword from '../pages/user/ResetPassword';
import OAuthComplete from '../pages/user/OAuthComplete';
import AdminLogin from '../pages/admin/AdminLogin';

const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'forgot-password', element: <ForgotPassword /> },
            { path: 'reset-password', element: <ResetPassword /> },
            { path: 'oauth/complete', element: <OAuthComplete /> },
            { path: 'posts/:id', element: <SinglePost /> },
            { path: 'users/:id', element: <Profile /> },
            { path: 'explore', element: <Explore /> },

            // Protected User Routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'bookmarks', element: <Dashboard /> },
                    { path: 'posts/new', element: <CreatePost /> },
                ]
            }
        ]
    },

    // Independent Admin Terminal Portal
    {
        path: '/admin/login',
        element: <AdminLogin />
    },

    // Protected Admin Routes
    {
        path: '/admin',
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'users', element: <AdminUsers /> },
                    { path: 'posts', element: <AdminPosts /> },
                    { path: 'posts/:id', element: <AdminPostDetail /> },
                ]
            }
        ]
    }
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
