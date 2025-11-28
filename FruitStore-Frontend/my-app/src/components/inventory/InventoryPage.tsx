"use client"; // BẮT BUỘC: Vì component này dùng hook (useEffect, useAuth, useState)

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider'; // Import hook để lấy token
import {Edit2, Warehouse, PlusCircle, Search, Trash2, DollarSign, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { formatLargeNumber } from '@/utils/formater_utilities';
import Spinner from '../commom/Spinner';
import AddProductModal from './AddProductModal';
import { InventoryItem, InventoryPageData, Supplier, Category } from '@/type/Inventory.types';
const PAGE_SIZE = 10;

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

export default function InventoryPage() {

    // Lấy token và trạng thái loading từ AuthProvider
    const { token, isLoading: isAuthLoading, hasRole } = useAuth();
    // State cho dữ liệu
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [pageData, setPageData] = useState<InventoryPageData | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    // State cho Phân trang, Sắp xếp, Lọc
    const [currentPage, setCurrentPage] = useState(0);
    const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
        field: 'name',
        direction: 'asc',
    });
    //State tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Trì hoãn 500ms
    const [filterSupplier, setFilterSupplier] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    //State quản lý modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State dùng để buộc useEffect fetch lại dữ liệu sau khi Thêm/Sửa/Xóa
    const [refreshKey, setRefreshKey] = useState(0);

    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const loadData = useCallback(async () => {
        if (isAuthLoading || !token) {
            setIsDataLoading(false);
            return;
        }
        setIsDataLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';


        const fetchItems = async () => {
            const sortParam = `${sort.field},${sort.direction}`;
            const params = new URLSearchParams({
                page: currentPage.toString(),
                size: PAGE_SIZE.toString(),
                sort: sortParam,
            });

            // Thêm tham số nếu có
            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm);
            }
            if (filterSupplier) {
                params.append('supplierId', filterSupplier);
            }
            if (filterCategory) {
                params.append('categoryId', filterCategory);
            }
            const apiUrl = `${backendApiUrl}/inventory/items?${params.toString()}`;

            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Lỗi tải Items: ${response.statusText}`);
            return response.json();
        };

        const fetchCategories = async () => {
            const apiUrl = `${backendApiUrl}/inventory/categories`;
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Lỗi tải Categories: ${response.statusText}`);
            return response.json();
        };

        const fetchSuppliers = async () => {
            const apiUrl = `${backendApiUrl}/suppliers`;
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Lỗi tải Suppliers: ${response.statusText}`);
            return response.json();
        };

        try {
            // Tối ưu: Chỉ fetch suppliers nếu mảng đang rỗng
            const suppliersDataPromise = suppliers.length === 0
                ? fetchSuppliers().catch(err => {
                    console.warn("Không thể tải danh sách nhà cung cấp (sẽ hiển thị ID):", err.message);
                    return [] as Supplier[]; // Trả về mảng rỗng nếu lỗi
                })
                : Promise.resolve(suppliers); // Dùng lại mảng cũ nếu đã có

            const categoriesDataPromise = categories.length === 0
                ? fetchCategories().catch(err => {
                    console.warn("Không thể tải danh sách danh mục:", err.message);
                    return [] as Category[];
                })
                : Promise.resolve(categories);
            // Gọi song song
            const [itemsData, suppliersData, categoriesData] = await Promise.all([
                fetchItems(),
                suppliersDataPromise,
                categoriesDataPromise
            ]);

            setPageData(itemsData as InventoryPageData);
            if (suppliers.length === 0) {
                setSuppliers(suppliersData as Supplier[]);
            }
            if (categories.length === 0) {
                setCategories(categoriesData as Category[]);
            }
            setFetchError(null);
        } catch (error: any) {
            console.error("Lỗi khi fetch dữ liệu (Items):", error);
            setFetchError(error.message);
        } finally {
            setIsDataLoading(false); // Tắt loading
        }

    }, [token, isAuthLoading, currentPage, sort, debouncedSearchTerm, filterSupplier, filterCategory]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshKey]);

    //reset trang về 0 khi người dùng tìm kiếm hoặc lọc
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm, filterSupplier, filterCategory]);

    const supplierMap = useMemo(() => {
        return new Map(suppliers.map(s => [s.id, s.name]));
    }, [suppliers]);


    const kpiData = useMemo(() => {
        const items = pageData?.content || [];
        if (items.length === 0) {
            return { totalQuantity: 0, lowStockCount: 0, totalValue: 0 };
        }

        const totalQuantity = formatLargeNumber(items.reduce((sum, item) => sum + item.quantity, 0));
        const lowStockCount = items.filter(item =>
            item.status === 'LOW' || item.status === 'SOLDOUT'
        ).length;
        const totalValue = formatLargeNumber(items.reduce((sum, item) => sum + (item.quantity * item.price), 0));

        return { totalQuantity, lowStockCount, totalValue };
    }, [pageData]);


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'LOW':
                return 'bg-yellow-100 text-yellow-800';
            case 'SOLDOUT':
                return 'bg-red-100 text-red-800';
            case 'AVAILABLE':
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const handleNextPage = () => {
        if (pageData && !pageData.last) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (pageData && !pageData.first) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleSort = (field: string) => {
        setSort(prevSort => ({
            field: field,
            direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(0);
    };

    //Hàm trợ giúp: Callback để refresh bảng sau khi Thêm/Sửa
    const handleRefresh = () => {
        setRefreshKey(key => key + 1);
    };

    const handleDelete = async (itemId: number, itemName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${itemName}?`)) {
            return;
        }

        if (!hasRole('ADMIN')) {
            alert("Bạn không có quyền thực hiện hành động này.");
            return;
        }

        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        try {
            const response = await fetch(`${backendApiUrl}/inventory/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                // Thử đọc lỗi từ Backend
                let errorMessage = `Lỗi ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) { /* Bỏ qua */ }
                throw new Error(errorMessage);
            }
            handleRefresh();

        } catch (error: any) {
            console.error("Lỗi khi xóa item:", error);
            setFetchError(`Không thể xóa: ${error.message}`);
        }
    };

    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true); 
    };
    const handleAddClick = () => {
        setEditingItem(null); 
        setIsModalOpen(true); 
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null); 
    };
    if (isAuthLoading) {
        return <Spinner variant="full" text="Đang tải trạng thái xác thực..." />;
    }

    if (isDataLoading && !pageData) {
        return <Spinner variant="full" text="Đang tải dữ liệu kho hàng..." />;
    }

    if (fetchError) {
        return <div className="p-4 text-red-500 text-center">Lỗi tải dữ liệu: {fetchError}</div>;
    }

    return (
        // Nội dung UI của trang Inventory
        <>
            {hasRole('ADMIN') && (
                <AddProductModal
                    isOpen={isModalOpen}
                     onClose={handleCloseModal}
                    onSuccessRefresh={handleRefresh}
                    suppliers={suppliers}
                    categories={categories}
                    itemToEdit={editingItem}
                />
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center font-sans tracking-tight mb-8">
                <Warehouse className="w-7 h-7 mr-3 text-green-600" />
                Quản Lý Kho Hàng Tồn Kho
            </h2>

            {/* Thẻ KPI nhỏ (Dữ liệu tĩnh, có thể cập nhật sau) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-lime-500">
                    <p className="text-sm font-medium text-gray-500">Tổng Số Lượng (kg/bó)</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{kpiData.totalQuantity}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
                    <p className="text-sm font-medium text-gray-500">Mục Tồn Kho Thấp</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{kpiData.lowStockCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-500">Giá Trị Tồn Kho Ước Tính</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1"><DollarSign className="w-5 h-5 inline mr-1" />{kpiData.totalValue}</p>
                </div>
            </div>

            {/* Khung điều khiển */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Thanh tìm kiếm */}
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        className="text-gray-500 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Dropdown Lọc */}
                <div className="flex-grow w-full md:w-auto">
                    <select
                        className="hover:cursor-pointer text-gray-500 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Lọc theo Danh Mục</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-grow w-full md:w-auto">
                    <select
                        className="hover:cursor-pointer text-gray-500 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        value={filterSupplier}
                        onChange={(e) => setFilterSupplier(e.target.value)}
                    >
                        <option value="">Lọc theo Nhà Cung Cấp</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Nút Thêm mới */}
                <div className="w-full md:w-auto">
                    {hasRole('ADMIN') && (
                        <button
                           onClick={handleAddClick} // Mở Modal
                            className="hover:cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng Dữ liệu Tồn kho */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Danh Sách Sản Phẩm</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* (CẬP NHẬT) Thêm logic Sort cho các cột */}
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                <span className="flex items-center">
                                    Tên Sản Phẩm <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh Mục</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('quantity')}
                            >
                                <span className="flex items-center">
                                    Tồn Kho <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('price')}
                            >
                                <span className="flex items-center">
                                    Đơn Giá <ArrowUpDown className="w-4 h-4 ml-1" />
                                </span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà Cung Cấp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            {hasRole('ADMIN') && (
                                <th className="px-6 py-3"></th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Hiển thị loading ngay trên bảng */}
                        {isDataLoading && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    {/* Sử dụng Spinner inline */}
                                    <Spinner variant="inline" size="sm" text="Đang tải dữ liệu..." />
                                </td>
                            </tr>
                        )}
                        {/* Hiển thị khi không có dữ liệu */}
                        {!isDataLoading && pageData?.content.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào.</td>
                            </tr>
                        )}
                        {/* Hiển thị dữ liệu */}
                        {!isDataLoading && pageData?.content.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{item.quantity} kg</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price.toLocaleString('vi-VN')} VNĐ</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplierMap.get(item.supplierId) || `ID: ${item.supplierId}`}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(item.status)}`}>
                                        {item.status === 'AVAILABLE' ? 'Còn hàng' : item.status === 'LOW' ? 'Sắp hết' : 'Hết hàng'}
                                    </span>
                                </td>
                                {hasRole('ADMIN') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleEditClick(item)} 
                                            className="hover:cursor-pointer text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="hover:cursor-pointer text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4 ml-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-700">
                            Đang hiển thị {' '}
                            <span className="font-medium">{pageData ? (pageData.number * PAGE_SIZE) + 1 : 0}</span>
                            {' '} đến {' '}
                            <span className="font-medium">{pageData ? (pageData.number * PAGE_SIZE) + pageData.content.length : 0}</span>
                            {' '} trong tổng số {' '}
                            <span className="font-medium">{pageData?.totalElements || 0}</span>
                            {' '} kết quả
                        </p>
                    </div>
                    <div className="flex items-center gap-x-3">
                        <button
                            onClick={handlePrevPage}
                            disabled={pageData?.first}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5 mr-1" aria-hidden="true" />
                            Trang trước
                        </button>
                        <span className="text-sm text-gray-900 font-medium px-4">
                            Trang {pageData ? pageData.number + 1 : 0} / {pageData?.totalPages || 0}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={pageData?.last}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trang sau
                            <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}