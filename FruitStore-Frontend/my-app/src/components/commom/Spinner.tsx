"use client";

import { Loader2 } from 'lucide-react'; // Import icon Loader
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    variant?: 'full' | 'inline';
}

const Spinner: React.FC<SpinnerProps> = ({ 
    size = 'md', 
    text = 'Đang tải...', 
    variant = 'full' 
}) => {
    
    let sizeClass = 'w-12 h-12';
    if (size === 'sm') sizeClass = 'w-6 h-6';
    if (size === 'lg') sizeClass = 'w-16 h-16';
    if (size === 'xl') sizeClass = 'w-24 h-24';

    const iconClasses = `animate-spin ${sizeClass} text-green-600`;

    // 1. Dạng Spinner Toàn màn hình (thay thế màn hình loading)
    if (variant === 'full') {
        return (
            <main className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-xl text-center flex flex-col items-center">
                    <Loader2 className={iconClasses} />
                    {text && (
                        <p className="text-lg font-medium text-gray-700 mt-4">{text}</p>
                    )}
                </div>
            </main>
        );
    }

    // 2. Dạng Spinner Inline (dùng trong bảng)
    return (
        <div className="flex items-center justify-center p-4">
            <Loader2 className={iconClasses} />
            {text && (
                <p className="text-md font-medium text-gray-700 ml-3">{text}</p>
            )}
        </div>
    );
};

export default Spinner;