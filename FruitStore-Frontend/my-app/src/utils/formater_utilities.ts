/**
 * Định dạng một số lớn (Number) thành chuỗi (String) rút gọn 
 * theo đơn vị Nghìn, Triệu, Tỷ (Việt Nam).
 * * @param num Số cần định dạng
 * @returns Chuỗi đã định dạng (ví dụ: "1.25 Tỷ", "15 Triệu", "500 Nghìn")
 */
export function formatLargeNumber(num: number): string {
    if (!num || num === 0) {
        return '0';
    }

    const format = (value: number, unit: string, decimals: number) => {
        const roundedValue = parseFloat(value.toFixed(decimals));
        return `${roundedValue.toLocaleString('vi-VN')} ${unit}`;
    };

    const absNum = Math.abs(num);

    if (absNum >= 1_000_000_000) {
        return format(num / 1_000_000_000, 'Tỷ', 3); 
    }
    if (absNum >= 1_000_000) {
        return format(num / 1_000_000, 'Triệu', 3);
    }
    if (absNum >= 1_000) {
        return format(num / 1_000, 'Nghìn', 3); 
    }
    return num.toLocaleString('vi-VN');
}