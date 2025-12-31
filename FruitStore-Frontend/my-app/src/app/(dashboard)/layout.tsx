"use client";

// Import các icon cần thiết cho layout
import { Sprout, User2, LayoutDashboard, Boxes, Users, PackageSearch, BarChart3, Menu, LogOut } from 'lucide-react';
import React from 'react';
import AuthWrapper from '@/components/AuthWrapper'; // Import AuthWrapper
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
// Layout này sẽ bọc các trang Dashboard, Inventory, v.v.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const handleMenuClick = () => {
  };
  const getLinkClass = (path: string) => {
    const isActive = (path === '/') ? pathname === path : pathname.startsWith(path);
    return isActive
      ? 'flex items-center p-3 text-green-700 bg-green-50 rounded-lg font-semibold transition duration-150 mb-2'
      : 'flex items-center p-3 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition duration-150 mb-2';
  };
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 hidden lg:block">
          <div className="text-2xl font-bold text-green-700 border-b pb-4 mb-6 flex items-center">
            <Sprout className="w-6 h-6 mr-2 text-lime-500" />
            VegiFarm Pro
          </div>
          <nav>
            <Link href="/" className={getLinkClass('/')}>
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Tổng Quan
            </Link>
            <Link href="/orders" className={getLinkClass('/orders')}>
              <PackageSearch className="w-5 h-5 mr-3" />
              Đơn Hàng
            </Link>
            <Link href="/inventory" className={getLinkClass('/inventory')}>
              <Boxes className="w-5 h-5 mr-3" />
              Kho Hàng (Rau Củ)
            </Link>
            <Link href="/customers" className={getLinkClass('/customers')}>
              <User2 className="w-5 h-5 mr-3" />
              Khách Hàng
            </Link>
            <Link href="suppliers" className={getLinkClass('/suppliers')}>
              <Users className="w-5 h-5 mr-3" />
              Nhà Cung Cấp
            </Link>

            <button
              onClick={logout}
              className="hover:cursor-pointer w-full flex items-center p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-150 mb-2 mt-6 border-t pt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng Xuất
            </button>
          </nav>
        </aside>

        {/* Nội dung chính (Bao gồm Header di động) */}
        <div className="flex-1 lg:ml-64">

          {/* Header cho Mobile/Tablet */}
          <header className="flex justify-between items-center lg:hidden bg-white p-4 shadow-md rounded-xl sticky top-0 z-10 m-4">
            <h1 className="text-xl font-bold text-green-800">VegiFarm Pro</h1>
            <button onClick={handleMenuClick} className="text-green-700 p-2 rounded-lg hover:bg-green-50">
              <Menu className="w-6 h-6" />
            </button>
          </header>

          {/* Nội dung trang con (children) sẽ được chèn vào đây */}
          <main className="p-4 md:p-8">
            {children}
          </main>

        </div>
      </div>
    </AuthWrapper>
  );
}