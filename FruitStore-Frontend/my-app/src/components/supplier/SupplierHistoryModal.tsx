import React, { useEffect, useState } from "react";

// 1. CẬP NHẬT INTERFACE: Khớp với InventoryResponseDTO bên Java
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  // Bên Java trả về categoryName (String), không phải object category nữa
  categoryName: string;
  // DTO bên Java trả về importDate (hoặc createdAt tùy bạn đặt), mình để cả 2 cho chắc
  importDate?: string;
  createdAt?: string;
}

interface SupplierHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number | null;
  supplierName: string;
}

const SupplierHistoryModal: React.FC<SupplierHistoryModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  supplierName,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && supplierId) {
      fetchHistory();
    }
  }, [isOpen, supplierId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // URL API Gateway
      const baseUrl = "http://localhost:8080/api/inventory";

      const response = await fetch(`${baseUrl}/supplier/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Dữ liệu nhận được:", data); // Log để kiểm tra tên trường dữ liệu
        setItems(data);
      } else {
        console.error("Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative animate-fade-in-down">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-gray-800">
            Lịch sử nhập hàng:{" "}
            <span className="text-green-600">{supplierName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Body: Bảng dữ liệu */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Chưa có lịch sử nhập hàng nào.
            </div>
          ) : (
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-5 py-3">Tên sản phẩm</th>
                  <th className="px-5 py-3">Danh mục</th>
                  <th className="px-5 py-3 text-right">Số lượng</th>
                  <th className="px-5 py-3 text-right">Giá nhập</th>
                  <th className="px-5 py-3 text-center">Ngày nhập</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-sm">
                      <span className="font-bold text-gray-900 text-base">
                        {item.name}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-sm">
                      <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {item.categoryName || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-sm text-right font-bold text-blue-600">
                      {item.quantity}
                    </td>

                    <td className="px-5 py-3 text-sm text-right font-medium text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}
                    </td>

                    <td className="px-5 py-3 text-sm text-center text-gray-600">
                      {/* Dùng importDate ưu tiên, nếu không có thì dùng createdAt */}
                      {new Date(
                        item.importDate || item.createdAt || Date.now()
                      ).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierHistoryModal;
