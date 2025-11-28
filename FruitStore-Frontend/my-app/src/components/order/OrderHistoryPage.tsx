"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { FileText, Eye, ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import Spinner from '@/components/commom/Spinner';
import { OrderResponse, OrderPageData } from '@/type/Order.types';
import OrderDetailsModal from './OrderDetailModal';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const formatDateForAPI = (date: Date | null | undefined): string => {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const PAGE_SIZE = 10;

export default function OrderHistoryPage() {
    const { token, isLoading: isAuthLoading } = useAuth();

    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
    const [startDate, endDate] = dateRange;
    const [queryDate, setQueryDate] = useState({
        start: formatDateForAPI(new Date()),
        end: formatDateForAPI(new Date())
    });

    const [pageData, setPageData] = useState<OrderPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Fetch Orders
    const fetchOrders = useCallback(async () => {
        if (isAuthLoading || !token) return;

        setIsLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                size: PAGE_SIZE.toString(),
            });

            if (queryDate.start) params.append('startDate', queryDate.start);
            if (queryDate.end) params.append('endDate', queryDate.end);

            const response = await fetch(`${backendApiUrl}/orders?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Lỗi tải đơn hàng: ${response.statusText}`);
            
            const data = await response.json();
            setPageData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setPageData(null);
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthLoading, currentPage, queryDate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    // Handlers
    const handleViewDetails = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleNextPage = () => {
        if (pageData && !pageData.last) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (pageData && !pageData.first) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleApplyFilter = () => {
        setCurrentPage(0);
        setQueryDate({
            start: formatDateForAPI(startDate),
            end: formatDateForAPI(endDate || startDate) 
        });
    };

    const handleClearFilter = () => {
        const today = new Date();
        setDateRange([today, today]);
        setQueryDate({ 
            start: formatDateForAPI(today), 
            end: formatDateForAPI(today) 
        });
        setCurrentPage(0);
    };
    // Helper để render trạng thái với màu sắc
    const renderStatusBadge = (status: string) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        let label = status;

        switch (status) {
            case 'PAID':
                colorClass = 'bg-green-100 text-green-800';
                label = 'Đã thanh toán';
                break;
            case 'PENDING':
                colorClass = 'bg-yellow-100 text-yellow-800';
                label = 'Chờ xử lý';
                break;
            case 'PROCESSING':
                colorClass = 'bg-blue-100 text-blue-800';
                label = 'Đang xử lý';
                break;
            case 'SHIPPED':
                colorClass = 'bg-indigo-100 text-indigo-800';
                label = 'Đang giao';
                break;
            case 'DELIVERED':
                colorClass = 'bg-teal-100 text-teal-800';
                label = 'Đã giao';
                break;
            case 'CANCELLED':
            case 'FAILED':
                colorClass = 'bg-red-100 text-red-800';
                label = status === 'FAILED' ? 'Thất bại' : 'Đã hủy';
                break;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {label}
            </span>
        );
    };

    if (isAuthLoading) return <Spinner variant="full" text="Đang xác thực..." />;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/orders" className="mr-4 p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    {/* (CẬP NHẬT) Font chữ đẹp hơn cho tiêu đề tiếng Việt: font-sans, tracking-tight, text-gray-900 */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center font-sans tracking-tight">
                        <FileText className="w-7 h-7 mr-3 text-blue-600" />
                        Lịch Sử Đơn Hàng
                    </h1>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
               <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Khoảng thời gian</label>
                    <div className="relative flex items-center w-72">
                        <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 z-10 pointer-events-none" />
                        
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                setDateRange(update);
                            }}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn khoảng ngày"
                            className="hover:cursor-pointer w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
                            wrapperClassName="w-full"
                        />
                    </div>
                </div>
                
                <div className="justify-start flex gap-2 mt-5 md:mt-5">
                    <button 
                        onClick={handleApplyFilter}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:cursor-pointer h-[42px]"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc
                    </button>

                    <button 
                        onClick={handleClearFilter}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition h-[42px] hover:cursor-pointer border border-gray-200"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Đặt lại hôm nay
                    </button>
                </div>
            </div>

            {error && <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-lg">{error}</div>}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh Toán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chi Tiết</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center">
                                    <Spinner variant="inline" size="sm" text="Đang tải dữ liệu..." />
                                </td>
                            </tr>
                        )}

                        {!isLoading && pageData?.content.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                    Chưa có đơn hàng nào.
                                </td>
                            </tr>
                        )}

                        {!isLoading && pageData?.content.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(order.orderDate).toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {order.customerId ? `KH #${order.customerId}` : 'Khách lẻ'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                    {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{order.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderStatusBadge(order.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleViewDetails(order)}
                                        className="hover:cursor-pointer text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-end w-full"
                                    >
                                        <Eye className="w-4 h-4 mr-1" /> Xem
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Thanh Phân Trang */}
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-700">
                            Trang <span className="font-medium">{pageData ? pageData.number + 1 : 1}</span> / {pageData?.totalPages || 1}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={!pageData || pageData.first}
                            className="text-gray-600 flex items-center justify-center px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={!pageData || pageData.last}
                            className="text-gray-600 flex items-center justify-center px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}