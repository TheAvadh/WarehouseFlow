import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CreateOrderModal } from './components/Orders/CreateOrderModal';
import { ToastProvider } from './components/UI/Toast';
import type { Order } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'orders' | 'customers' | 'products'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrderId(null);
  };

  const handleOrderCreated = (newOrder: Order) => {
    setSelectedOrderId(newOrder.id);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />

        <div className="flex flex-1">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setSelectedOrderId(null);
            }}
          />

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {selectedOrderId ? (
              <OrderDetailPage orderId={selectedOrderId} onBack={handleBackToOrders} />
            ) : currentTab === 'dashboard' ? (
              <DashboardPage
                onViewOrder={handleViewOrder}
                onCreateOrderClick={() => setIsCreateModalOpen(true)}
              />
            ) : currentTab === 'orders' ? (
              <OrdersListPage
                onViewOrder={handleViewOrder}
                onCreateOrderClick={() => setIsCreateModalOpen(true)}
              />
            ) : currentTab === 'customers' ? (
              <CustomersPage />
            ) : (
              <ProductsPage />
            )}
          </main>
        </div>

        <CreateOrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
