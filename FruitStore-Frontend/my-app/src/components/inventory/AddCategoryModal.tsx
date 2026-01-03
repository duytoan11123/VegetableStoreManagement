"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { PlusCircle, X, Loader2 } from "lucide-react";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    setLoading(true);
    setError(null);

    const backendApiUrl =
      process.env.NEXT_PUBLIC_BACK_END_API || "http://localhost:8080/api";

    try {
      const response = await fetch(`${backendApiUrl}/inventory/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể thêm danh mục");
      }

      onSuccess();
      onClose();
      setName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <PlusCircle className="w-6 h-6 mr-3 text-blue-600" />
          Thêm Danh Mục Mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Danh Mục
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Rau củ, Trái cây nhập khẩu..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {loading ? "Đang thêm..." : "Thêm Danh Mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
