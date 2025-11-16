import AuthWrapper from '@/components/AuthWrapper'; 
import OrderPage from '@/components/order/OrderPage';

export default function OrdersRoute() {
  return (
    <AuthWrapper>
      <OrderPage />
    </AuthWrapper>
  );
}