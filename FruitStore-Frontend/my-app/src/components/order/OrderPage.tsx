"use client"; 

import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { useAuth } from '@/context/AuthProvider'; 
import { Search,X, Filter, ShoppingCart, UserSearch, CreditCard, DollarSign, Trash2, Plus, Minus, PackageX } from 'lucide-react'; 
import Spinner from '@/components/commom/Spinner'; 
import { Category, InventoryItem, Supplier } from '@/type/Inventory.types';
import { Customer } from '@/type/Customer.types';
import { CartItem, CreateOrderRequestDTO } from '@/type/Order.types';
import { formatLargeNumber } from '../../utils/formater_utilities';

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

// Kiểu dữ liệu cho các API (Page)
interface InventoryPageData {
    content: InventoryItem[];
}
interface CustomerPageData {
    content: Customer[];
}

// --- COMPONENT CHÍNH ---
export default function OrderPage() {
    
    const { token, isLoading: isAuthLoading, user } = useAuth();
    
    // State cho dữ liệu fetch
    const [products, setProducts] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    // State cho Lọc (Filter)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [customerSearch, setCustomerSearch] = useState('');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedCustomerSearch = useDebounce(customerSearch, 300);

    // State cho Giỏ hàng (Cart)
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');

    // State hệ thống
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

    // 1. Fetch Sản phẩm (Khi Filter hoặc Search thay đổi)
    const fetchProducts = useCallback(async () => {
        if (isAuthLoading || !token) return;
        
        setIsLoadingProducts(true);
        const params = new URLSearchParams({
            page: '0',
            size: '50', // Chỉ lấy 50 sản phẩm
            sort: 'name,asc',
        });
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (filterCategory) params.append('categoryId', filterCategory);

        try {
            const response = await fetch(`${backendApiUrl}/inventory/items?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Lỗi tải sản phẩm');
            const data: InventoryPageData = await response.json();
            setProducts(data.content || []);
        } catch (error: any) {
            setSubmitError(error.message);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [token, isAuthLoading, debouncedSearchTerm, filterCategory, backendApiUrl]);

    // 2. Fetch Danh mục (Chỉ 1 lần)
    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${backendApiUrl}/inventory/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Lỗi tải danh mục');
            const data: Category[] = await response.json();
            setCategories(data);
        } catch (error: any) {
            console.error(error.message);
        }
    }, [token, backendApiUrl]);

    // 3. Fetch Khách hàng (Khi tìm kiếm KH)
    const fetchCustomers = useCallback(async () => {
        if (isAuthLoading || !token || !debouncedCustomerSearch) {
            setCustomers([]);
            return;
        }
        
        setIsLoadingCustomers(true);
        const params = new URLSearchParams({
            search: debouncedCustomerSearch,
        });

        try {
            const response = await fetch(`${backendApiUrl}/customers?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Lỗi tải khách hàng');
            // Giả định API trả về List (không phân trang)
            const data: Customer[] = await response.json(); 
            setCustomers(data);
        } catch (error: any) {
            setSubmitError(error.message);
        } finally {
            setIsLoadingCustomers(false);
        }
    }, [token, isAuthLoading, debouncedCustomerSearch, backendApiUrl]);

    // Gọi API khi component tải
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // --- Logic Giỏ Hàng ---

    const handleAddToCart = (product: InventoryItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const newQuantity = (parseInt(String(existingItem.cartQuantity)) || 0) + 1;
                return prevCart.map(item => 
                    item.id === product.id 
                    ? { ...item, cartQuantity: newQuantity } 
                    : item
                );
            } else {
                // Thêm mới vào giỏ
                return [...prevCart, { ...product, cartQuantity: 1 }];
            }
        });
    };

    const handleUpdateQuantity = (productId: number, newQuantity: number|string) => {
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === productId 
                ? { ...item, cartQuantity: newQuantity } 
                : item
            )
            
        );
    };

    const handleBlurQuantity = (productId: number) => {
        setCart(prevCart => {
            const itemToUpdate = prevCart.find(item => item.id === productId);
            if (!itemToUpdate) return prevCart;
            // Chuyển đổi 'cartQuantity' (có thể là string rỗng) thành số
            const newQuantity = parseInt(String(itemToUpdate.cartQuantity), 10) || 0;
            if (newQuantity <= 0) {
                // Xóa item nếu số lượng là 0
                return prevCart.filter(item => item.id !== productId);
            } else {
                // Chuẩn hóa giá trị (ví dụ: '05' -> 5)
                return prevCart.map(item => 
                    item.id === productId 
                    ? { ...item, cartQuantity: newQuantity } 
                    : item
                );
            }
        });
    };

    const handleRemoveFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(''); // Xóa thanh tìm kiếm KH
        setCustomers([]); // Xóa kết quả
    };

    // Tính toán Tổng tiền (dùng useMemo)
    const { subTotal, discount, total } = useMemo(() => {
        const subTotal = cart.reduce((sum, item) => {
            const quantity = parseInt(String(item.cartQuantity), 10) || 0;
            return sum + (item.price * quantity);
        }, 0);
        
        // (Logic Giảm giá) Giảm 10% nếu chọn khách hàng thành viên
        const discountRate = selectedCustomer ? 0.10 : 0; 
        const discount = subTotal * discountRate;
        const total = subTotal - discount;
        
        return { subTotal, discount, total };
    }, [cart, selectedCustomer]);

    // --- Submit Đơn Hàng ---
    const handleSubmitOrder = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        const validCartItems = cart
            .map(item => ({
                ...item,
                cartQuantity: parseInt(String(item.cartQuantity), 10) || 0
            }))
            .filter(item => item.cartQuantity > 0);

        if (validCartItems.length === 0) {
            setSubmitError("Giỏ hàng đang trống hoặc số lượng không hợp lệ!");
            setIsSubmitting(false);
            setCart([]); // Xóa các item rỗng
            return;
        }
        
        
        // Tạo DTO gửi đi
        const orderDTO: CreateOrderRequestDTO = {
            customerId: selectedCustomer?.id || null,
            paymentMethod: paymentMethod,
            totalPrice: total,
            items: validCartItems.map(item => ({ 
                productId: item.id,
                productName: item.name, 
                quantity: item.cartQuantity, 
                pricePerUnit: item.price
            }))
        };

        try {
            const response = await fetch(`${backendApiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDTO),
            });

            if (!response.ok) {
                const errorBody = await response.text(); 

                throw new Error(errorBody || `Lỗi ${response.status}`);
            }

            // Thành công
            alert("Tạo đơn hàng thành công!");
            // Reset giỏ hàng
            setCart([]);
            setSelectedCustomer(null);
            setPaymentMethod('CASH');
            fetchProducts(); 
        } catch (error: any) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Render ---
    if (isAuthLoading) {
        return <Spinner variant="full" text="Đang tải..." />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-full">
            
            {/* CỘT BÊN TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:w-2/3">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 mt-4 lg:mt-0 flex items-center">
                    Tạo Đơn Hàng Mới
                </h2>
                {/* Thanh Lọc */}
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên sản phẩm..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-grow">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500"
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
                </div>

                {/* Danh sách Sản phẩm */}
                <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[60vh]">
                    {isLoadingProducts ? (
                        <Spinner variant="inline" text="Đang tải sản phẩm..." />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {products.length === 0 && <p>Không tìm thấy sản phẩm.</p>}
                            
                            {products.map(product => (
                                <button 
                                    key={product.id}
                                    onClick={() => handleAddToCart(product)}
                                    // Tắt nút nếu hết hàng
                                    disabled={product.status === 'SOLDOUT' || product.quantity <= 0}
                                    className="border rounded-lg p-3 text-left hover:shadow-md transition group hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="font-semibold text-gray-800 truncate">{product.name}</div>
                                    <div className="text-sm text-green-600 font-bold">
                                        {product.price.toLocaleString('vi-VN')} VNĐ
                                    </div>
                                    <div className={`text-xs ${product.quantity > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                                        Kho: {product.quantity} kg
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CỘT BÊN PHẢI: GIỎ HÀNG (CART) */}
            <div className="lg:w-1/3">
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <ShoppingCart className="w-6 h-6 mr-2 text-green-600" />
                        Giỏ Hàng
                    </h3>

                    {/* Danh sách Item trong Giỏ hàng */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 pr-2">
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                                <PackageX className="w-12 h-12 mb-2" />
                                <p>Giỏ hàng đang trống</p>
                            </div>
                        )}
                        {cart.map(item => (
                            <div key={item.id} className="py-3 flex items-center gap-3">
                                <div className="flex-grow">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">{item.price.toLocaleString('vi-VN')} VNĐ</div>
                                </div>
                                {/* Ô Nhập Số lượng */}
                                <input 
                                    type="number"
                                    value={item.cartQuantity}
                                    onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                    onBlur={() => handleBlurQuantity(item.id)}
                                    className="w-16 text-center border border-gray-300 rounded-lg py-1 text-gray-500"
                                    min="0"
                                />
                                <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Thêm Khách hàng (Giảm giá) */}
                    <div className="mt-6 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thêm Khách hàng (Giảm 10%)</label>
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                <span className="text-green-700 font-medium">{selectedCustomer.name}</span>
                                <button onClick={() => setSelectedCustomer(null)} className="text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <UserSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email KH..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-500"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                                {/* Kết quả tìm kiếm KH */}
                                {customers.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {isLoadingCustomers ? <p className="p-2 text-sm">Đang tìm...</p> : 
                                            customers.map(customer => (
                                                <button 
                                                    key={customer.id} 
                                                    onClick={() => handleSelectCustomer(customer)}
                                                    className="block w-full text-left p-2 text-sm hover:bg-gray-100"
                                                >
                                                    {customer.name} ({customer.email})
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chọn Thanh toán */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPaymentMethod('CASH')}
                                className={`text-gray-500 hover: cursor-pointer flex-1 flex items-center justify-center p-3 rounded-lg border-2 ${paymentMethod === 'CASH' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}
                            >
                                <DollarSign className="w-5 h-5 mr-2" /> Tiền mặt
                            </button>
                            <button
                                onClick={() => setPaymentMethod('CARD')}
                                className={`text-gray-500 hover: cursor-pointer flex-1 flex items-center justify-center p-3 rounded-lg border-2 ${paymentMethod === 'CARD' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}
                            >
                                <CreditCard className="w-5 h-5 mr-2" /> Thẻ
                            </button>
                        </div>
                    </div>

                    {/* Tính tiền */}
                    <div className="mt-6 border-t pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính:</span>
                            <span>{subTotal.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá (KH):</span>
                            <span>- {discount.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-gray-900">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                    </div>
                    
                    {submitError && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4">{submitError}</p>
                    )}

                    {/* Nút Submit */}
                    <button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting || cart.length === 0}
                        className="mt-6 w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 hover:cursor-pointer"
                    >
                        {isSubmitting ? <Spinner variant="inline" size="sm" text="Đang xử lý..." /> : "Xác nhận Thanh toán"}
                    </button>
                </div>
            </div>
        </div>
    );
}