"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { X, PlusCircle, Loader2, Edit, UserPlus } from 'lucide-react';
import { Customer } from '@/type/Customer.types';

// DTO cho Backend (Khớp với CustomerRequestDTO.java)
interface CustomerRequestData {
    name: string;
    email: string;
    phone: string;
}

// Props cho component
interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessRefresh: () => void; 
    customerToEdit: Customer | null; // Dữ liệu KH cần sửa
}

// Kiểu dữ liệu state của Form
interface FormData {
    name: string;
    email: string;
    phone: string;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccessRefresh, 
    customerToEdit 
}) => {
    const { token } = useAuth();
    
    const isEditMode = customerToEdit !== null;

    const [formData, setFormData] = useState<FormData>({
        name: '', email: '', phone: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // useEffect để điền dữ liệu (pre-populate) khi Sửa
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && customerToEdit) {
                // Chế độ Sửa: Điền form
                setFormData({
                    name: customerToEdit.name,
                    phone: customerToEdit.phone,
                    email: customerToEdit.email,
                });
            } else {
                // Chế độ Thêm: Reset form
                setFormData({
                    name: '', email: '', phone: '',
                });
            }
            setSubmitError(null);
            setErrors({});
        }
    }, [isOpen, isEditMode, customerToEdit]); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Tên không được để trống.';
        if (!formData.email) newErrors.email = 'Email không được để trống.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm Submit (POST hoặc PUT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null); 

        if (!validateForm()) return; 

        setIsLoading(true);
        const backendApiUrl = process.env.NEXT_PUBLIC_BACK_END_API || 'http://localhost:8080/api';

        const method = isEditMode ? 'PUT' : 'POST';
        const apiUrl = isEditMode 
            ? `${backendApiUrl}/customers/${customerToEdit?.id}` 
            : `${backendApiUrl}/customers`;

        const requestBody: CustomerRequestData = { ...formData };

        try {
            const response = await fetch(apiUrl, {
                method: method, 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody), 
            });

            if (!response.ok) {
                let errorMessage = `Lỗi ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) { /* Bỏ qua */ }
                throw new Error(errorMessage);
            }
            onSuccessRefresh(); 
            onClose(); 
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                <button 
                    onClick={onClose} 
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition hover:cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    {isEditMode ? <Edit className="w-6 h-6 mr-3 text-blue-600" /> : <UserPlus className="w-6 h-6 mr-3 text-green-600" />}
                    {isEditMode ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Khách Hàng</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`text-gray-500 mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`text-gray-500 mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`text-gray-500 mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    
                    {submitError && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>

                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition hover:cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-4 py-2 text-white rounded-lg font-medium flex items-center disabled:opacity-70 hover:cursor-pointer
                                ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (isEditMode ? <Edit className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />)}
                            {isLoading ? (isEditMode ? 'Đang cập nhật...' : 'Đang thêm...') : (isEditMode ? 'Lưu Thay Đổi' : 'Thêm KH')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;