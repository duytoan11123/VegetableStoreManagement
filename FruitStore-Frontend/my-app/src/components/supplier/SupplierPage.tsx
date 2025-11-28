"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Users, PlusCircle, Search, ChevronLeft, ChevronRight, ArrowUpDown, Edit2, Trash2, PackagePlus } from 'lucide-react';
import Spinner from "../commom/Spinner";
import AddSupplierModal from '../supplier/SupplierModal';
import ImportGoodsModal from './ImportGoodsModal';
import { Supplier, SupplierPageData } from '../../type/Supplier.types';


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

export default function SupplierPage() {

    const { token, isLoading: isAuthLoading, hasRole } = useAuth();

    // State cho Dữ liệu
    const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // State cho Điều khiển 
    const [sort, setSort] = useState<{ field: keyof Supplier; direction: 'asc' | 'desc' }>({
        field: 'name',
        direction: 'asc',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [refreshKey, setRefreshKey] = useState(0);

    // State cho Modals
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // Hook chính để fetch dữ liệu
    const loadData = useCallback(async () => {
        if (isAuthLoading || !token) {
            setIsDataLoading(false);
            return;
        }
        setIsDataLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        const fetchSuppliers = async () => {
            const params = new URLSearchParams();
            // Chỉ gửi 'search' (không gửi page, size, sort)
            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm);
            }

            const apiUrl = `${backendApiUrl}/suppliers?${params.toString()}`;

            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Lỗi tải NCC: ${response.statusText}`);

            const data = await response.json();
            // (SỬA LỖI) Backend trả về mảng (List), không phải (Page)
            if (!Array.isArray(data)) {
                throw new Error("Phản hồi API không hợp lệ (không phải mảng).");
            }
            return data;
        };

        try {
            const suppliersData = await fetchSuppliers();
            setSuppliers(suppliersData as Supplier[]); // 👈 Set mảng
            setFetchError(null);
        } catch (error: any) {
            console.error("Lỗi khi fetch dữ liệu NCC:", error);
            setFetchError(error.message);
            setSuppliers([]); // Đặt mảng rỗng nếu lỗi
        } finally {
            setIsDataLoading(false);
        }
    }, [token, isAuthLoading, debouncedSearchTerm]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshKey]);

    // --- Handlers ---
    const handleSort = (field: keyof Supplier) => { // 👈 Dùng kiểu keyof Supplier
        setSort(prevSort => ({
            field: field,
            direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const displayedSuppliers = useMemo(() => {
        // Sao chép mảng
        const sortedSuppliers = [...(suppliers || [])];

        // Sắp xếp
        sortedSuppliers.sort((a, b) => {
            const fieldA = a[sort.field];
            const fieldB = b[sort.field];

            let comparison = 0;
            // Xử lý an toàn nếu giá trị là null hoặc undefined (mặc dù không nên)
            if (fieldA > fieldB || fieldA === null) {
                comparison = 1;
            } else if (fieldA < fieldB || fieldB === null) {
                comparison = -1;
            }
            return sort.direction === 'asc' ? comparison : -comparison;
        });

        return sortedSuppliers;
    }, [suppliers, sort]);


    const handleRefresh = () => {
        setRefreshKey(key => key + 1);
    };

    // (CRUD Handlers)
    const handleAddClick = () => {
        setSelectedSupplier(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditClick = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setSelectedSupplier(null);
    };

    // (Import Goods Handlers)
    const handleImportClick = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsImportModalOpen(true);
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
        setSelectedSupplier(null);
        // "Nhập hàng" có thể ảnh hưởng đến kho, nên tải lại cả trang này (nếu cần)
        // và cả trang Inventory (khi người dùng quay lại đó)
        handleRefresh();
    };

    // (Delete Handler)
    const handleDelete = async (supplierId: number, supplierName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa NCC: ${supplierName}? (Hành động này có thể thất bại nếu NCC đang được liên kết với sản phẩm)`)) {
            return;
        }
        if (!hasRole('ADMIN')) {
            alert("Bạn không có quyền thực hiện hành động này.");
            return;
        }
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';
        try {
            const response = await fetch(`${backendApiUrl}/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Lỗi khi xóa NCC");
            handleRefresh();
        } catch (error: any) {
            setFetchError(`Không thể xóa: ${error.message}`);
        }
    };


    // --- Render ---
    if (isAuthLoading) {
        return <Spinner variant="full" text="Đang tải trạng thái xác thực..." />;
    }
    if (isDataLoading && suppliers === null) { 
        return <Spinner variant="full" text="Đang tải danh sách nhà cung cấp..." />;
    }
     if (fetchError && suppliers === null) {
        return <div className="p-4 text-red-500 text-center">Lỗi tải dữ liệu: {fetchError}</div>;
    }

    return (
        <>
            {/* Khai báo các Modals (chỉ hiển thị khi isOpen=true) */}
            {hasRole('ADMIN') && (
                <AddSupplierModal
                    isOpen={isAddEditModalOpen}
                    onClose={handleCloseAddEditModal}
                    onSuccessRefresh={handleRefresh}
                    supplierToEdit={selectedSupplier}
                />
            )}

            {hasRole('ADMIN') && (
                <ImportGoodsModal
                    isOpen={isImportModalOpen}
                    onClose={handleCloseImportModal}
                    onSuccessRefresh={handleRefresh}
                    supplierId={selectedSupplier?.id || null}
                    supplierName={selectedSupplier?.name || null}
                />
            )}

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center font-sans tracking-tight mb-6">
                <Users className="w-7 h-7 mr-3 text-green-600" />
                Quản Lý Nhà Cung Cấp
            </h2>

            {/* Khung điều khiển (Search/Filter/Add) */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên NCC..."
                        className="text-gray-500 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-auto">
                    {hasRole('ADMIN') && (
                        <button
                            onClick={handleAddClick}
                            className="hover:cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Thêm NCC Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng Dữ liệu Tồn kho */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Danh Sách Nhà Cung Cấp</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                <span className="flex items-center">
                                    Tên NCC <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người liên hệ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>

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
                        {!isDataLoading && displayedSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={hasRole('ADMIN') ? 5 : 4} className="p-4 text-center text-gray-500">
                                    {fetchError ? `Lỗi: ${fetchError}` : "Không tìm thấy nhà cung cấp nào."}
                                </td>
                            </tr>
                        )}

                        {!isDataLoading && displayedSuppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>

                                {hasRole('ADMIN') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-x-3">
                                        <button
                                            onClick={() => handleImportClick(supplier)}
                                            title="Nhập hàng từ NCC này"
                                            className="hover:cursor-pointer text-green-600 hover:text-green-900"
                                        >
                                            <PackagePlus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(supplier)}
                                            title="Sửa NCC"
                                            className="hover:cursor-pointer text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id, supplier.name)}
                                            title="Xóa NCC"
                                            className="hover:cursor-pointer text-red-600 hover:text-red-900"
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
                        <span className="font-medium">{displayedSuppliers.length}</span>
                        {' '} kết quả
                    </p>
                </div>
            </div>
        </>
    );
}