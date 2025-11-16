import AuthWrapper from '@/components/AuthWrapper'; 
import SupplierPage from '../../../components/supplier/SupplierPage'; 


export default function SuppliersRoute() {
  return (

    <AuthWrapper>
      <SupplierPage />
    </AuthWrapper>
  );
}