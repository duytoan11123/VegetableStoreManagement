"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { X, Loader2, PackagePlus, AlertCircle } from "lucide-react";
import { InventoryItem } from "../../type/Inventory.types";
import Spinner from "../commom/Spinner";

// DTO cho import items gửi xuống inventory
interface ImportItemDTO {
  itemId: number;
  quantityToAdd: number;
  price: number;
}
interface ImportGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRefresh: () => void;
  supplierId: number | null;
  supplierName: string | null;
}
type ImportFormState = Record<
  string,
  {
    quantity: string | number;
    price: string | number;
  }
>;

const ImportGoodsModal: React.FC<ImportGoodsModalProps> = ({
  isOpen,
  onClose,
  onSuccessRefresh,
  supplierId,
  supplierName,
}) => {
  // ... (Toàn bộ logic state và hàm (fetch, handleChange, handleSubmit) không đổi) ...
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [importFormState, setImportFormState] = useState<ImportFormState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token && supplierId) {
      setIsLoading(true);
      setSubmitError(null);

      const fetchItemsBySupplier = async () => {
        const backendApiUrl =
          process.env.NEXT_PUBLIC_BACK_END_API || "http://localhost:8080/api";
        const apiUrl = `${backendApiUrl}/inventory/items?supplierId=${supplierId}&size=2000`;

        try {
          const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok)
            throw new Error("Không thể tải danh sách sản phẩm của NCC");

          const data = await response.json();
          const itemsData = data.content || [];
          setItems(itemsData);

          const initialFormState: ImportFormState = {};
          for (const item of itemsData) {
            initialFormState[item.id] = {
              quantity: "",
              price: item.price,
            };
          }
          setImportFormState(initialFormState);
        } catch (err: any) {
          setSubmitError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItemsBySupplier();
    }
  }, [isOpen, supplierId, token]);

  const handleChange = (
    itemId: number,
    field: "quantity" | "price",
    value: string
  ) => {
    const numValue =
      field === "quantity" ? parseInt(value, 10) : parseFloat(value);

    setImportFormState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: isNaN(numValue) ? "" : numValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    const itemsToImport: ImportItemDTO[] = Object.entries(importFormState)
      .map(([itemIdStr, data]) => {
        const itemId = parseInt(itemIdStr, 10);
        const quantityToAdd = parseInt(String(data.quantity), 10) || 0;
        const price = parseFloat(String(data.price)) || 0;
        return { itemId, quantityToAdd, price };
      })
      .filter((item) => item.quantityToAdd > 0 && item.price > 0);

    if (itemsToImport.length === 0) {
      setSubmitError(
        "Bạn chưa nhập số lượng và đơn giá hợp lệ cho bất kỳ sản phẩm nào."
      );
      setIsLoading(false);
      return;
    }

    const backendApiUrl =
      process.env.NEXT_PUBLIC_BACK_END_API || "http://localhost:8080/api";

    try {
      const response = await fetch(`${backendApiUrl}/inventory/import-stock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemsToImport),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi gửi yêu cầu nhập hàng");
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          disabled={isLoading}
          // (SỬA LỖI 1) Thêm hover:cursor-pointer
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition hover:cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ... (Tiêu đề không đổi) ... */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <PackagePlus className="w-6 h-6 mr-3 text-green-600" />
          Nhập Hàng Tồn Kho
        </h2>
        <p className="text-sm text-gray-600 mb-6 border-b pb-4">
          Nhà cung cấp:{" "}
          <span className="font-semibold text-green-700">{supplierName}</span>
        </p>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
            {submitError}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          {/* Bảng sản phẩm (Scrollable) */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {isLoading && (
              <Spinner variant="inline" size="sm" text="Đang tải sản phẩm..." />
            )}

            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                <p className="font-medium text-gray-700">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-sm text-gray-500">
                  Nhà cung cấp này chưa có sản phẩm nào trong kho.
                </p>
              </div>
            )}

            {!isLoading &&
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`item-qty-${item.id}`}
                      className="block text-sm font-medium text-gray-900"
                    >
                      {item.name}
                    </label>
                    <span className="text-xs text-gray-500">
                      Hiện có: {item.quantity} kg
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor={`item-qty-${item.id}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Số lượng nhập
                    </label>
                    <input
                      type="number"
                      id={`item-qty-${item.id}`}
                      name={`item-qty-${item.id}`}
                      value={importFormState[item.id]?.quantity || ""}
                      onChange={(e) =>
                        handleChange(item.id, "quantity", e.target.value)
                      }
                      min="0"
                      placeholder="VD: 50"
                      // (SỬA LỖI 2) Thêm text-gray-500
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`item-price-${item.id}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Đơn giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      id={`item-price-${item.id}`}
                      name={`item-price-${item.id}`}
                      value={importFormState[item.id]?.price || ""}
                      onChange={(e) =>
                        handleChange(item.id, "price", e.target.value)
                      }
                      min="0"
                      placeholder="VD: 15000"
                      // (SỬA LỖI 3) Thêm text-gray-500
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-500"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Nút Submit (Sticky Footer) */}
          <div className="pt-6 mt-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              // (SỬA LỖI 4) Thêm hover:cursor-pointer
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition hover:cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              // (SỬA LỖI 5) Thêm hover:cursor-pointer
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center disabled:opacity-70 hover:cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <PackagePlus className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Đang nhập hàng..." : "Xác nhận Nhập Hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportGoodsModal;
