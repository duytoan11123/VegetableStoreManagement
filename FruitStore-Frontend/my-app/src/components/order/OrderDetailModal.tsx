"use client";

import React from 'react';
import { X, Package, Calendar, CreditCard, User } from 'lucide-react';
import { OrderResponse } from '@/type/Order.types';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderResponse | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition hover:cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-600" />
                    Chi Tiết Đơn Hàng #{order.id}
                </h2>
                
                {/* Thông tin chung */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b pb-4">
                    <div className="text-sm">
                        <p className="text-gray-600 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Ngày đặt</p>
                        <p className="text-gray-500 font-medium">{new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-gray-600 flex items-center"><CreditCard className="w-3 h-3 mr-1"/> Thanh toán</p>
                        <p className="text-gray-500 font-medium">{order.paymentMethod} - <span className={`font-bold ${order.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{order.status}</span></p>
                    </div>
                    <div className="text-sm">
                        <p className="text-gray-600 flex items-center"><User className="w-3 h-3 mr-1"/> Khách hàng ID</p>
                        <p className="text-gray-500 font-medium">{order.customerId || 'Khách lẻ'}</p>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <h3 className="font-semibold text-gray-700 mb-3">Sản phẩm đã mua</h3>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">SL</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.pricePerUnit.toLocaleString('vi-VN')}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500 text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                        {(item.pricePerUnit * item.quantity).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900">Tổng cộng:</td>
                                <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                                    {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition hover:cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;