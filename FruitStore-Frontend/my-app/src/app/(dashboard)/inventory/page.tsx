import AuthWrapper from '@/components/AuthWrapper'; 
import InventoryPage from '@/components/inventory/InventoryPage';
// Component Trang (Server Component)
export default function InventoryRoute() {

    return (
        <AuthWrapper>
            <InventoryPage />
        </AuthWrapper>
    );
}