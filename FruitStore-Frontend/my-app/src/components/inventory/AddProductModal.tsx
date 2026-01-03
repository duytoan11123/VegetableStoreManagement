"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Edit, X, PlusCircle, Loader2 } from "lucide-react";
import {
  Supplier,
  Category,
  InventoryItem,
  CreateItemData,
  AddProductModalProps,
  FormData,
} from "@/type/Inventory.types";
const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccessRefresh,
  suppliers,
  categories,
  itemToEdit,
}) => {
  const { token } = useAuth();

  const isEditMode = itemToEdit !== null;
  const [formData, setFormData] = useState<CreateItemData>({
    name: "",
    quantity: "",
    price: "",
    supplierId: "",
    categoryId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && itemToEdit) {
        setFormData({
          name: itemToEdit.name,
          quantity: itemToEdit.quantity,
          price: itemToEdit.price,
          categoryId:
            categories.find((c) => c.name === itemToEdit.categoryName)?.id ||
            "",
          supplierId: itemToEdit.supplierId,
        });
      } else {
        setFormData({
          name: "",
          quantity: "",
          price: "",
          supplierId: "",
          categoryId: "",
        });
      }
      setSubmitError(null);
      setErrors({});
    }
  }, [isOpen, isEditMode, itemToEdit, categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi của trường này khi người dùng sửa
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Dùng '!' (dấu chấm than) để kiểm tra ('' | null | undefined)
    if (!formData.name) {
      newErrors.name = "Tên sản phẩm không được để trống.";
    }
    if (!formData.quantity) {
      newErrors.quantity = "Số lượng không được để trống.";
    }
    // Kiểm tra '!' VÀ kiểm tra giá trị (cho số)
    if (!formData.price || parseFloat(String(formData.price)) <= 0) {
      newErrors.price = "Đơn giá phải là số dương.";
    }
    if (!formData.supplierId) {
      newErrors.supplierId = "Vui lòng chọn nhà cung cấp.";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    const backendApiUrl =
      process.env.NEXT_PUBLIC_BACK_END_API || "http://localhost:8080/api";
    const method = isEditMode ? "PUT" : "POST";
    const apiUrl = isEditMode
      ? `${backendApiUrl}/inventory/items/${itemToEdit?.id}`
      : `${backendApiUrl}/inventory/items`;

    const requestBody = {
      name: formData.name,
      quantity: parseInt(String(formData.quantity)) || 0,
      price: parseFloat(String(formData.price)) || 0,
      supplierId: parseInt(String(formData.supplierId)) || 0,
      categoryId: parseInt(String(formData.categoryId)) || 0,
    };

    try {
      const response = await fetch(apiUrl, {
        method: method, // Dùng method động
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Lỗi ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          /* Bỏ qua */
        }
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
    // Lớp phủ (Overlay)
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 transition-opacity">
      {/* Nội dung Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
        {/* Nút Đóng (X) */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="hover:cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          {isEditMode ? (
            <Edit className="w-6 h-6 mr-3 text-blue-600" />
          ) : (
            <PlusCircle className="w-6 h-6 mr-3 text-green-600" />
          )}
          {isEditMode ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </h2>

        {/* Form Thêm Mới/ Sửa */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên Sản Phẩm */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tên Sản Phẩm
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Hàng 2 cột: Số lượng và Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Số Lượng (kg)
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Đơn Giá (VNĐ)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Hàng 2 cột: Nhà Cung Cấp và Danh Mục */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="supplierId"
                className="block text-sm font-medium text-gray-700"
              >
                Nhà Cung Cấp
              </label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                className="hover:cursor-pointer text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn Nhà Cung Cấp --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700"
              >
                Danh Mục
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId} // (SỬA LỖI) Bỏ || ''
                onChange={handleChange}
                required
                className="hover:cursor-pointer text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Báo lỗi Submit */}
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {submitError}
            </p>
          )}

          {/* Nút Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="hover:cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`hover:cursor-pointer px-4 py-2 text-white rounded-lg font-medium transition shadow-md flex items-center disabled:opacity-70 
                                ${
                                  isEditMode
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : isEditMode ? (
                <Edit className="w-5 h-5 mr-2" />
              ) : (
                <PlusCircle className="w-5 h-5 mr-2" />
              )}
              {isLoading
                ? isEditMode
                  ? "Đang cập nhật..."
                  : "Đang thêm..."
                : isEditMode
                ? "Lưu Thay Đổi"
                : "Thêm Sản Phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
