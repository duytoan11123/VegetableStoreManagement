import AuthWrapper from '@/components/AuthWrapper'; 
import OrderHistoryPage from '@/components/order/OrderHistoryPage';

export default function OrderHistoryRoute() {
  return (
    <AuthWrapper>
      <OrderHistoryPage />
    </AuthWrapper>
  );
}