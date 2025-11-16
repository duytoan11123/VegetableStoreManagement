import AuthWrapper from '@/components/AuthWrapper'; 
import CustomerPage from '@/components/customers/CustomerPage';

export default function CustomersRoute() {
  return (
    <AuthWrapper>
      <CustomerPage />
    </AuthWrapper>
  );
}