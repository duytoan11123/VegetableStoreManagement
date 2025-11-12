"use client"; // 👈 BẮT BUỘC: Vì chúng ta dùng hook useAuth (là client-side)

import { useAuth } from '../context/AuthProvider'; // 👈 Import hook

export default function Home() {
  // Lấy trạng thái và hàm từ context
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Next.js 14 + Keycloak</h1>
      
      {isAuthenticated ? (
        <div>
          {/* Hiển thị thông tin user nếu đã đăng nhập */}
          <p>Xin chào, {user?.firstName} {user?.lastName} ({user?.email})</p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <div>
          {/* Hiển thị nút login nếu chưa đăng nhập */}
          <p>Bạn chưa đăng nhập.</p>
          <button onClick={login}>Đăng nhập với Keycloak</button>
        </div>
      )}
    </main>
  );
}