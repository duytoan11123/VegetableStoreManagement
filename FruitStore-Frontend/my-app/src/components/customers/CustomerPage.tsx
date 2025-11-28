"use client"; 

import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { useAuth } from '@/context/AuthProvider'; 
import { Users, PlusCircle, Search, ArrowUpDown, Edit2, Trash2, Star } from 'lucide-react'; // Thêm Star icon
import Spinner from '../commom/Spinner';
import CustomerModal from './CustomerModal';
import { Customer } from '@/type/Customer.types';

// Hook useDebounce
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function CustomerPage() {
    
    const { token, isLoading: isAuthLoading, hasRole } = useAuth();
    
    const [customers, setCustomers] = useState<Customer[] | null>(null); 
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true); 
    
    const [sort, setSort] = useState<{ field: keyof Customer; direction: 'asc' | 'desc' }>({
        field: 'name', 
        direction: 'asc',
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); 
    const [refreshKey, setRefreshKey] = useState(0); 
    
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Logic Fetch (Giống SupplierPage)
    const loadData = useCallback(async () => {
        if (isAuthLoading || !token) {
            setIsDataLoading(false); 
            return;
        }
        setIsDataLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        const fetchCustomers = async () => {
            const params = new URLSearchParams();
            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm); 
            }
            
            const apiUrl = `${backendApiUrl}/customers?${params.toString()}`;
            
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Lỗi tải KH: ${response.statusText}`);
            
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Phản hồi API không hợp lệ (không phải mảng).");
            }
            return data;
        };

        try {
            const customersData = await fetchCustomers();
            setCustomers(customersData as Customer[]); 
            setFetchError(null); 
        } catch (error: any) {
            console.error("Lỗi khi fetch dữ liệu KH:", error);
            setFetchError(error.message);
            setCustomers([]); // Đặt mảng rỗng nếu lỗi
        } finally {
            setIsDataLoading(false); 
        }
    }, [token, isAuthLoading, debouncedSearchTerm]); 

    useEffect(() => {
        loadData(); 
    }, [loadData, refreshKey]); 

    // Logic Sort (Client-side)
    const displayedCustomers = useMemo(() => {
        const sortedCustomers = [...(customers || [])];
        
        sortedCustomers.sort((a, b) => {
            const fieldA = a[sort.field];
            const fieldB = b[sort.field];

            let comparison = 0;
            if (fieldA > fieldB || fieldA === null) {
                comparison = 1;
            } else if (fieldA < fieldB || fieldB === null) {
                comparison = -1;
            }
            return sort.direction === 'asc' ? comparison : -comparison;
        });
        
        return sortedCustomers;
    }, [customers, sort]);


    // Handlers
    const handleSort = (field: keyof Customer) => { 
        setSort(prevSort => ({
            field: field,
            direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    const handleRefresh = () => {
        setRefreshKey(key => key + 1);
    };
    const handleAddClick = () => {
        setSelectedCustomer(null); 
        setIsAddEditModalOpen(true); 
    };
    const handleEditClick = (customer: Customer) => {
        setSelectedCustomer(customer); 
        setIsAddEditModalOpen(true); 
    };
    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setSelectedCustomer(null); 
    };
    
    const handleDelete = async (customerId: number, customerName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa KH: ${customerName}?`)) {
            return;
        }
        if (!hasRole('ADMIN')) { 
            alert("Bạn không có quyền thực hiện hành động này.");
            return;
        }
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';
        try {
            const response = await fetch(`${backendApiUrl}/customers/${customerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Lỗi khi xóa KH");
            handleRefresh();
        } catch (error: any) {
            setFetchError(`Không thể xóa: ${error.message}`);
        }
    };

    // --- Render ---
    if (isAuthLoading) {
        return <Spinner variant="full" text="Đang tải trạng thái xác thực..." />;
    }
    
    if (isDataLoading && customers === null) { 
        return <Spinner variant="full" text="Đang tải danh sách khách hàng..." />;
    }
    
    if (fetchError && customers === null) {
        return <div className="p-4 text-red-500 text-center">Lỗi tải dữ liệu: {fetchError}</div>;
    }

    return (
        <>
            {hasRole('ADMIN') && (
                <CustomerModal
                    isOpen={isAddEditModalOpen}
                    onClose={handleCloseAddEditModal}
                    onSuccessRefresh={handleRefresh}
                    customerToEdit={selectedCustomer}
                />
            )}

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center font-sans tracking-tight mb-6">
                <Users className="w-7 h-7 mr-3 text-green-600" />
                Quản Lý Khách Hàng
            </h2>
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-auto">
                    {hasRole('ADMIN') && (
                        <button 
                            onClick={handleAddClick} 
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md hover:cursor-pointer"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Thêm KH Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng Dữ liệu Tồn kho */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Danh Sách Khách Hàng</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                <span className="flex items-center">
                                    Tên Khách Hàng <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('email')}
                            >
                                <span className="flex items-center">
                                    Email <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('loyaltyPoints')}
                            >
                                <span className="flex items-center">
                                    Điểm Tích Lũy <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            
                            {hasRole('ADMIN') && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        
                        {isDataLoading && (
                            <tr>
                                <td colSpan={hasRole('ADMIN') ? 5 : 4} className="p-4 text-center text-gray-500">
                                    <Spinner variant="inline" size="sm" text="Đang tải dữ liệu..." />
                                </td>
                            </tr>
                        )}

                        {!isDataLoading && displayedCustomers.length === 0 && (
                            <tr>
                                <td colSpan={hasRole('ADMIN') ? 5 : 4} className="p-4 text-center text-gray-500">
                                    {fetchError ? `Lỗi: ${fetchError}` : "Không tìm thấy khách hàng nào."}
                                </td>
                            </tr>
                        )}
                        
                        {!isDataLoading && displayedCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="flex items-center text-amber-600">
                                        <Star className="w-4 h-4 mr-1 text-amber-500" />
                                        {customer.loyaltyPoints}
                                    </span>
                                </td>

                                {hasRole('ADMIN') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-x-3">
                                        <button 
                                            onClick={() => handleEditClick(customer)} 
                                            title="Sửa KH"
                                            className="text-indigo-600 hover:text-indigo-900 hover:cursor-pointer"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(customer.id, customer.name)}
                                            title="Xóa KH"
                                            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <p className="text-sm text-gray-700">
                        Hiển thị tổng số {' '}
                        <span className="font-medium">{displayedCustomers.length}</span>
                        {' '} kết quả
                    </p>
                </div>
            </div>
        </>
    );
}