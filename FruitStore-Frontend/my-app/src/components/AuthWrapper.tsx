'use client'; 

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';


interface AuthWrapperProps {
    children: React.ReactNode; 
}


const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    // Lấy trạng thái, user, login/logout, và trạng thái loading
    const { isAuthenticated, login, isLoading } = useAuth(); 

    // Logic: Tự động chuyển hướng nếu chưa xác thực
    useEffect(() => {
        // Chỉ chạy sau khi Keycloak đã hoàn tất quá trình khởi tạo (isLoading = false)
        if (!isLoading && !isAuthenticated) {
            // Chuyển hướng người dùng đến trang đăng nhập Keycloak
            login();
        }
    }, [isLoading, isAuthenticated, login]);

    // Trạng thái 1: Đang tải hoặc chưa xác thực (Hiển thị màn hình chờ)
    if (isLoading || !isAuthenticated) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-xl text-center">
                    {isLoading ? (
                        <p className="text-lg font-medium text-gray-700">Đang kết nối Keycloak và kiểm tra xác thực...</p>
                    ) : (
                        <p className="text-lg font-medium text-red-500">Bạn chưa đăng nhập. Đang chuyển hướng...</p>
                    )}
                </div>
            </main>
        );
    }

    // Trạng thái 2: Đã đăng nhập (isAuthenticated = true)
    return <>{children}</>;
};

export default AuthWrapper;