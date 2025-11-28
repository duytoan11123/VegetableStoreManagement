interface InventorySummary {
    totalQuantity: number;
    lowStockItems: number;
}

interface OrderSummary {
    todayOrders: number;
    growthRate: number;
}

 interface RevenueSummary {
    currentMonthRevenue: number;
    growthRate: number;
}

 interface CustomerSummary {
    totalCustomers: number;
    newCustomersToday: number;
}

export interface DailyRevenueChartItem {
    date: string; // "YYYY-MM-DD"
    revenue: number;
}
 interface BestsellerItem {
    productId: number;
    productName: string;
    totalQuantity: number;
}

 interface LowStockItem {
    id: number;
    name: string;
    quantity: number;
    status: string;
    categoryName: string;
}

export default interface DashboardData {
    inventory: InventorySummary;
    orders: OrderSummary;
    revenue: RevenueSummary;
    customers: CustomerSummary;
    revenueChart: DailyRevenueChartItem[];
    topSellingItems: BestsellerItem[];
    lowStockItems: LowStockItem[];
}