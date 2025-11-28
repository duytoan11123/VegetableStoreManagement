"use client";

// Import các Icon CHỈ DÙNG cho nội dung Dashboard
import {LayoutDashboard, Leaf, PackagePlus, TrendingUp, AlertTriangle, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import DashboardData, { DailyRevenueChartItem } from '@/type/Dashboard.types';
import { formatLargeNumber } from '@/utils/formater_utilities';
import Spinner from '@/components/commom/Spinner';

const HomePage: React.FC = () => {
    const { token, isLoading: isAuthLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!token) {
            setIsLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

            try {
                const response = await fetch(`${backendApiUrl}/reporting/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error(`Lỗi tải Dashboard: ${response.statusText}`);
                }

                const result: DashboardData = await response.json();
                setData(result);
            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }
        , [token, isAuthLoading]);

    const renderGrowth = (rate: number) => {
        const isPositive = rate >= 0;
        return (
            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'} ml-2`}>
                {isPositive ? '↑' : '↓'} {Math.abs(rate).toFixed(1)}%
            </span>
        );
    };

    const renderRevenueChart = (chartData: DailyRevenueChartItem[]) => {
        if (!chartData || chartData.length === 0) return <p className="text-gray-400 text-sm text-center mt-10">Chưa có dữ liệu</p>;
        
        const maxRevenue = Math.max(...chartData.map(d => d.revenue));
        
        return (
            <div className="w-full h-64 flex flex-col justify-end pt-4 pb-2">
                <div className="flex items-end justify-between h-full gap-3 px-2">
                    {chartData.map((item, index) => {
                        const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                        const dateParts = item.date.split('-').map(Number);
                        const day = dateParts[2];
                        const month = dateParts[1];
                        const displayDate = `${day}/${month}`;
                        
                        return (
                            <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                    {formatLargeNumber(item.revenue)}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                                
                                <div 
                                    className={`w-full rounded-t-md transition-all duration-500 relative hover:opacity-80 ${item.revenue > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                                    style={{ 
                                        height: item.revenue > 0 ? `${heightPercent}%` : '4px' 
                                    }}
                                ></div>
                                <span className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium text-center w-full truncate">
                                    {displayDate}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Đường kẻ ngang đáy */}
                <div className="w-full h-[1px] bg-gray-200 mt-0"></div>
            </div>
        );
    };
    if (isAuthLoading) return <Spinner variant="full" text="Đang tải xác thực..." />;
    if (isLoading) return <Spinner variant="full" text="Đang tổng hợp dữ liệu báo cáo..." />;
    if (error) return <div className="p-8 text-center text-red-500">Không thể tải Dashboard: {error}</div>;
    if (!data) return null;
    return (
        // Sử dụng React Fragment <> thay vì <div> layout
        <>
            {/* Tiêu đề trang */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center font-sans tracking-tight">
                        <LayoutDashboard className="w-7 h-7 mr-3 text-green-600" />
                        Tổng Quan Hoạt Động
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật thời gian thực từ hệ thống</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm border">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>

            {/* GRID 1: Thẻ KPI Tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* KPI 1: Tổng Tồn Kho */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-lime-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Tổng Tồn Kho (kg)</p>
                        <Leaf className="w-6 h-6 text-lime-600 bg-lime-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{data.inventory.totalQuantity.toLocaleString('vi-VN')}</p>
                </div>

                {/* KPI 2: Đơn Hàng Mới */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Đơn Hàng Mới (24h)</p>
                        <PackagePlus className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{data.orders.todayOrders}</p>
                    <p className="text-xs text-red-500 mt-1">{renderGrowth(data.orders.growthRate)}</p>
                </div>

                {/* KPI 3: Lợi Nhuận Tháng */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Lợi Nhuận Tháng</p>
                        <TrendingUp className="w-6 h-6 text-blue-600 bg-blue-100 p-1 rounded-full" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{formatLargeNumber(data.revenue.currentMonthRevenue)}</p>
                    <p className="text-xs text-green-500 mt-1">{renderGrowth(data.revenue.growthRate)}</p>
                </div>

                {/* KPI 4: Hàng sắp hết hạn */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Cảnh Báo Hết Hạn</p>
                        <AlertTriangle className="w-6 h-6 text-amber-600 bg-amber-100 p-1 rounded-full" />
                    </div>
                    <p className="text-xs text-amber-500 mt-1">Đang cập nhật</p>
                </div>
            </div>

            {/* GRID 2: Biểu đồ và Danh sách */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột chính (2/3): Biểu đồ Doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Doanh Thu 7 Ngày Gần Nhất</h3>
                        <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 w-full">
                        {renderRevenueChart(data.revenueChart)}
                    </div>
                </div>

                {/* Cột phụ (1/3): Hàng bán chạy */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Bán Chạy Nhất</h3>

                    {data.topSellingItems.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Chưa có dữ liệu bán hàng.</p>
                    ) : (
                        <ul className="space-y-3">
                            {data.topSellingItems.map((item, index) => (
                                <li key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="flex items-center overflow-hidden">
                                        <span className={`
                                            flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border text-gray-500'}
                                        `}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700 truncate">{item.productName}</span>
                                    </div>
                                    <span className="text-sm text-green-600 font-bold whitespace-nowrap">
                                        {item.totalQuantity} kg
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* GRID 3: Bảng danh sách tồn kho thấp */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span>Tồn kho thấp cần nhập thêm</span>
                    <a href="/inventory" className="text-sm text-green-600 font-medium hover:text-green-800 transition flex items-center">
                        Quản lý kho 
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản Phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh Mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn Kho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.lowStockItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">Tất cả sản phẩm đều đủ hàng.</td>
                                </tr>
                            ) : (
                                data.lowStockItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{item.quantity} kg</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${item.status === 'SOLDOUT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {item.status === 'SOLDOUT' ? 'Hết hàng' : 'Sắp hết'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default HomePage;