"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../utils/keycloak'; // Import instance đã tạo
import { KeycloakProfile, KeycloakInitOptions } from 'keycloak-js';
import Spinner from '../components/commom/Spinner';
import '../app/globals.css'
// 1. Định nghĩa kiểu cho Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: KeycloakProfile | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean; // Thêm trạng thái loading
  token: string | null;
  hasRole: (role: string) => boolean;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'login-required',
  silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
  pkceMethod: 'S256',
};

// 3. Tạo Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với trạng thái loading
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window !== 'undefined') {
      // Khởi tạo Keycloak
      keycloak.init(keycloakInitOptions)
        .then(async (authenticated) => {
          setIsAuthenticated(authenticated);
          setToken(keycloak.token || null);

          if (authenticated) {
            // Lấy thông tin user nếu đã đăng nhập
            const profile = await keycloak.loadUserProfile();
            setUser(profile);

            setInterval(() => {
              keycloak.updateToken(70).then(refreshed => {
                if (refreshed) {
                  console.log('Token refreshed');
                  setToken(keycloak.token || null); // Cập nhật token mới
                }
              }).catch(() => {
                console.error('Failed to refresh token');
                keycloak.logout();
              });
            }, 60000);
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
  const hasRole = (role: string): boolean => {
        // Keycloak tự động thêm "ROLE_" nếu bạn dùng Spring Security
        // nhưng keycloak.hasRealmRole() chỉ kiểm tra tên gốc (ví dụ: 'ADMIN')
        return keycloak.authenticated ? keycloak.hasRealmRole(role) : false;
    };

  // Hiển thị loading trong khi Keycloak đang khởi tạo
  if (isLoading) {
    return ( <Spinner variant="full" size="sm" text="Đang tải dữ liệu người dùng..." />) 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading, hasRole }}>
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