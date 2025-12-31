"use client";

import React, { useEffect, useState } from 'react';
import { Leaf, PackagePlus, TrendingUp, AlertTriangle, ArrowRight, DollarSign, Calendar, Download, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import Spinner from '../../components/commom/Spinner';
import { formatLargeNumber } from '@/utils/formater_utilities';
// Import DatePicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

interface InventorySummary { totalQuantity: number; lowStockItems: number; }
interface OrderSummary { todayOrders: number; growthRate: number; }
interface RevenueSummary { currentMonthRevenue: number; growthRate: number; }
interface CustomerSummary { totalCustomers: number; newCustomersToday: number; }
interface DailyRevenueChartItem { date: string; revenue: number; }
interface BestsellerItem { productId: number; productName: string; totalQuantity: number; }
interface LowStockItem { id: number; name: string; quantity: number; status: string; categoryName: string; }

interface DashboardData {
    inventory: InventorySummary;
    orders: OrderSummary;
    revenue: RevenueSummary;
    customers: CustomerSummary;
    revenueChart: DailyRevenueChartItem[];
    topSellingItems: BestsellerItem[];
    lowStockItems: LowStockItem[];
}

// Helper: Format ngày cho API (YYYY-MM-DD)
const formatDateForAPI = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const DashboardUI: React.FC = () => {
    const { token, isLoading: isAuthLoading } = useAuth();

    // State cho Dashboard Tổng
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // State Riêng cho Biểu đồ (Chart)
    const [chartData, setChartData] = useState<DailyRevenueChartItem[]>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);

    // Mặc định biểu đồ hiển thị 7 ngày gần nhất
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultEndDate.getDate() - 6);

    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([defaultStartDate, defaultEndDate]);
    const [startDate, endDate] = dateRange;
    // State để đánh dấu nút nào đang active (7 ngày / 30 ngày / Custom)
    const [activeFilter, setActiveFilter] = useState<'7days' | '30days' | 'custom'>('7days');


    // 1. Fetch Dashboard Tổng 
    useEffect(() => {
        if (isAuthLoading || !token) return;

        const fetchDashboardData = async () => {
            const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';
            try {
                const response = await fetch(`${backendApiUrl}/reporting/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error(`Lỗi tải Dashboard: ${response.statusText}`);

                const result: DashboardData = await response.json();
                setData(result);
                // Khởi tạo dữ liệu biểu đồ từ dashboard tổng (mặc định 7 ngày)
                setChartData(result.revenueChart);
            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, isAuthLoading]);

    // 2. Hàm Fetch Biểu đồ Riêng
    const fetchCustomChart = async (start: Date, end: Date) => {
        if (!token) return;
        setIsChartLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        const startStr = formatDateForAPI(start);
        const endStr = formatDateForAPI(end);

        try {
            // Gọi API Reporting Service 
            const response = await fetch(`${backendApiUrl}/reporting/chart?startDate=${startStr}&endDate=${endStr}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setChartData(result);
            }
        } catch (err) {
            console.error("Lỗi tải biểu đồ:", err);
        } finally {
            setIsChartLoading(false);
        }
    };

    // Handler: Chọn nhanh 7 ngày
    const handleSet7Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        setDateRange([start, end]);
        setActiveFilter('7days');
        fetchCustomChart(start, end);
    };

    // Handler: Chọn nhanh 30 ngày
    const handleSet30Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        setDateRange([start, end]);
        setActiveFilter('30days');
        fetchCustomChart(start, end);
    };

    // Handler: Khi thay đổi lịch 
    const handleDateChange = (update: [Date | null, Date | null]) => {
        setDateRange(update);
        setActiveFilter('custom');
        // Chỉ fetch khi người dùng đã chọn xong cả ngày bắt đầu và kết thúc
        if (update[0] && update[1]) {
            fetchCustomChart(update[0], update[1]);
        }
    };



    // Hàm Export 
    const handleExport = async () => {
        if (!token) return;
        setIsExporting(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        // Lấy tháng hiện tại để xuất báo cáo
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            const response = await fetch(`${backendApiUrl}/reporting/export/monthly?month=${month}&year=${year}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Lỗi khi tải file báo cáo');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bao_cao_thang_${month}_${year}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Không thể xuất báo cáo.');
        } finally {
            setIsExporting(false);
        }
    };

    // Helper Render 
    const renderGrowth = (rate: number) => {
        const isPositive = rate >= 0;
        return (
            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'} ml-2`}>
                {isPositive ? '↑' : '↓'} {Math.abs(rate).toFixed(1)}%
            </span>
        );
    };

    const renderRevenueChart = (chartDataItems: DailyRevenueChartItem[]) => {
        if (!chartDataItems || chartDataItems.length === 0) return <p className="text-gray-400 text-sm text-center mt-10">Chưa có dữ liệu</p>;

        const maxRevenue = Math.max(...chartDataItems.map(d => d.revenue));

        return (
            <div className="w-full h-64 flex flex-col justify-end pb-2">
                <div className="w-full flex-grow overflow-x-auto pt-12 pb-2 scrollbar-hide">
                    <div className="flex items-end h-full gap-2 px-2" style={{ minWidth: chartDataItems.length > 10 ? 'max-content' : '100%' }}>
                        {chartDataItems.map((item, index) => {
                            const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                            const dateParts = item.date.split('-').map(Number);
                            const displayDate = `${dateParts[2]}/${dateParts[1]}`;

                            return (
                                <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end min-w-[32px]">
                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                                        {formatLargeNumber(item.revenue)}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                    </div>

                                    <div
                                        className={`w-full rounded-t-md transition-all duration-500 relative hover:opacity-80 ${item.revenue > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        style={{ height: item.revenue > 0 ? `${heightPercent}%` : '4px' }}
                                    ></div>

                                    <span className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium text-center w-full truncate">
                                        {displayDate}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-full h-[1px] bg-gray-200 mt-0"></div>
            </div>
        );
    };

    if (isAuthLoading) return <Spinner variant="full" text="Đang tải xác thực..." />;
    if (isLoading) return <Spinner variant="full" text="Đang tổng hợp dữ liệu báo cáo..." />;
    if (error) return <div className="p-8 text-center text-red-500">Không thể tải Dashboard: {error}</div>;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Tổng Quan Hoạt Động</h2>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật thời gian thực từ hệ thống</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} disabled={isExporting} className="flex items-center text-sm bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition disabled:opacity-50 hover:cursor-pointer">
                        {isExporting ? <span className="animate-spin mr-2">⏳</span> : <Download className="w-4 h-4 mr-2" />}
                        {isExporting ? 'Đang xuất...' : 'Xuất Báo Cáo'}
                    </button>
                    <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm border flex items-center">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {new Date().toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-lime-500">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Tổng Tồn Kho (kg)</p><Leaf className="w-6 h-6 text-lime-600 bg-lime-100 p-1 rounded-full" /></div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{data.inventory.totalQuantity.toLocaleString('vi-VN')}</p>
                    <p className="text-xs text-gray-400 mt-1">Sản phẩm có sẵn</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Đơn Hàng Hôm Nay</p><PackagePlus className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-full" /></div>
                    <div className="flex items-baseline mt-2"><p className="text-3xl font-bold text-gray-800">{data.orders.todayOrders}</p>{renderGrowth(data.orders.growthRate)}</div>
                    <p className="text-xs text-gray-400 mt-1">So với hôm qua</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Doanh Thu Tháng</p><TrendingUp className="w-6 h-6 text-blue-600 bg-blue-100 p-1 rounded-full" /></div>
                    <div className="flex items-baseline mt-2"><p className="text-3xl font-bold text-gray-800">{formatLargeNumber(data.revenue.currentMonthRevenue)}</p>{renderGrowth(data.revenue.growthRate)}</div>
                    <p className="text-xs text-gray-400 mt-1">So với tháng trước</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-amber-500">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Đang cập nhật</p><AlertTriangle className="w-6 h-6 text-amber-600 bg-amber-100 p-1 rounded-full" /></div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{data.inventory.lowStockItems}</p>
                    <p className="text-xs text-amber-600 mt-1 font-medium">Đang cập nhật</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- BIỂU ĐỒ DOANH THU VỚI BỘ LỌC --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center">
                            <h3 className="text-xl font-semibold text-gray-800 mr-3">Biểu Đồ Doanh Thu</h3>
                            {/* Spinner nhỏ khi đang tải riêng biểu đồ */}
                            {isChartLoading && <Spinner variant="inline" size="sm" />}
                        </div>

                        {/* Thanh công cụ lọc biểu đồ */}
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={handleSet7Days}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeFilter === '7days' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    7 Ngày
                                </button>
                                <button
                                    onClick={handleSet30Days}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeFilter === '30days' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    30 Ngày
                                </button>
                            </div>

                            <div className="relative">
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM"
                                    placeholderText="Tùy chọn ngày"
                                    className={`w-32 px-3 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer ${activeFilter === 'custom' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-600'}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        {renderRevenueChart(chartData)}
                    </div>
                </div>

                {/* Top Bán Chạy  */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Bán Chạy Nhất</h3>
                    {data.topSellingItems.length === 0 ? (
                        <p className="text-gray-500 text-sm italic text-center py-10">Chưa có dữ liệu bán hàng.</p>
                    ) : (
                        <ul className="space-y-3">
                            {data.topSellingItems.map((item, index) => (
                                <li key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="flex items-center overflow-hidden">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border text-gray-500'}`}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700 truncate">{item.productName}</span>
                                    </div>
                                    <span className="text-sm text-green-600 font-bold whitespace-nowrap">{item.totalQuantity} kg</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Bảng Cảnh báo */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span>Cảnh Báo Nhập Hàng</span>
                    <a href="/suppliers" className="text-sm text-green-600 font-medium hover:text-green-800 transition flex items-center hover:cursor-pointer">
                        Nhập thêm <ArrowRight className="w-4 h-4 ml-1" />
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
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Tất cả sản phẩm đều đủ hàng.</td></tr>
                            ) : (
                                data.lowStockItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{item.quantity} kg</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'SOLDOUT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
        </div>
    );
};

export default DashboardUI;