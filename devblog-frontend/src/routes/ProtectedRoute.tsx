/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const isAdminRoute = allowedRoles?.includes('ADMIN');

    if (!isAuthenticated) {
        return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace />;
    }

    const resolvedUser = (user as any)?.data?.user || (user as any)?.data || user;

    if (allowedRoles && resolvedUser && !allowedRoles.includes(resolvedUser.role)) {
        return <Navigate to={isAdminRoute ? "/admin/login" : "/"} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
