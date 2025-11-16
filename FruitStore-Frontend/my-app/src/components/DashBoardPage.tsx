"use client";

// Import các Icon CHỈ DÙNG cho nội dung Dashboard
import { Leaf, PackagePlus, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import React from 'react';

// Dữ liệu giả định cho Dashboard
const dashboardData = {
    inventory: '12,500',
    orders: '215',
    profit: '84.2',
    warning: '14',
    bestSellers: [
        { name: 'Cà Rốt Tươi', weight: '450 kg' },
        { name: 'Cà Chua Đà Lạt', weight: '380 kg' },
        { name: 'Bông Cải Xanh', weight: '310 kg' },
        { name: 'Khoai Tây', weight: '290 kg' },
    ],
};

const HomePage: React.FC = () => {

    return (
        // Sử dụng React Fragment <> thay vì <div> layout
        <>
            {/* Tiêu đề trang */}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 mt-4 lg:mt-0">
                Tổng Quan Hoạt Động
            </h2>

            {/* GRID 1: Thẻ KPI Tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* KPI 1: Tổng Tồn Kho */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-lime-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Tổng Tồn Kho (kg)</p>
                        <Leaf className="w-6 h-6 text-lime-600 bg-lime-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.inventory}</p>
                    <p className="text-xs text-green-500 mt-1">↑ 8% so với tháng trước</p>
                </div>

                {/* KPI 2: Đơn Hàng Mới */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Đơn Hàng Mới (24h)</p>
                        <PackagePlus className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.orders}</p>
                    <p className="text-xs text-red-500 mt-1">↓ 2.5% so với hôm qua</p>
                </div>

                {/* KPI 3: Lợi Nhuận Tháng */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Lợi Nhuận Tháng (Tr VNĐ)</p>
                        <TrendingUp className="w-6 h-6 text-blue-600 bg-blue-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.profit}</p>
                    <p className="text-xs text-green-500 mt-1">↑ 15% so với mục tiêu</p>
                </div>

                {/* KPI 4: Hàng sắp hết hạn */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Cảnh Báo Hết Hạn</p>
                        <AlertTriangle className="w-6 h-6 text-amber-600 bg-amber-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.warning}</p>
                    <p className="text-xs text-amber-500 mt-1">Cần xử lý gấp!</p>
                </div>
            </div>

            {/* GRID 2: Biểu đồ và Danh sách */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột chính (2/3): Biểu đồ Doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Doanh Thu 7 Ngày Gần Nhất</h3>

                    <div className="h-64 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                        [Placeholder cho Biểu đồ Doanh thu]
                    </div>
                </div>

                {/* Cột phụ (1/3): Hàng bán chạy */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Rau Củ Bán Chạy Nhất</h3>

                    <ul id="best-sellers-list" className="space-y-4">
                        {dashboardData.bestSellers.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition duration-150">
                                <span className="font-medium text-gray-700">{index + 1}. {item.name}</span>
                                <span className="text-sm text-green-600 font-bold">{item.weight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* GRID 3: Bảng danh sách tồn kho thấp */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    Tồn Kho Thấp Cần Nhập Thêm
                    <button className="text-sm text-green-600 font-medium hover:text-green-800 transition duration-150 flex items-center">
                        Xem tất cả
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản Phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn Kho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cảnh Báo</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Dữ liệu mô phỏng */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rau Muống Hữu Cơ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RM-001</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">50 kg</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        Thấp
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Nhập hàng</a>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bí Đao Xanh</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">BD-010</td>
                                <td className="px-6 py-4 whitespace-nowfap text-sm text-gray-500">120 kg</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Trung bình
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Nhập hàng</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default HomePage;