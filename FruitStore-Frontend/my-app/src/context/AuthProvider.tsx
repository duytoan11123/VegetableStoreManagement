"use client"; // 👈 BẮT BUỘC: Vì file này dùng Hooks (useState, useEffect, useContext)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../utils/keycloak'; // Import instance đã tạo
import { KeycloakProfile } from 'keycloak-js';

// 1. Định nghĩa kiểu cho Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: KeycloakProfile | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean; // Thêm trạng thái loading
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Tạo Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với trạng thái loading

  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window !== 'undefined') {
      // Khởi tạo Keycloak
      keycloak.init({ onLoad: 'check-sso' })
        .then(async (authenticated) => {
          setIsAuthenticated(authenticated);
          
          if (authenticated) {
            // Lấy thông tin user nếu đã đăng nhập
            const profile = await keycloak.loadUserProfile();
            setUser(profile);
          }
        })
        .catch(error => {
          console.error("Keycloak init failed:", error);
        })
        .finally(() => {
          setIsLoading(false); // Kết thúc loading
        });
    }
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  // Hiển thị loading trong khi Keycloak đang khởi tạo
  if (isLoading) {
    return (<div>Loading...</div>) // Bạn có thể thay bằng spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Tạo Custom Hook (để dễ dàng sử dụng context)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};