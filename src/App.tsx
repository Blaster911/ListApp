import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { ItemForm } from '@/components/ItemForm';
import { ItemList } from '@/components/items/ItemList';
import { HistoryPage } from '@/components/history/HistoryPage';
import { StockManagementPage } from '@/components/stocks/StockManagementPage';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] -z-10" />
      <div className="absolute inset-0 bg-gradient-radial-t from-indigo-100/20 via-transparent to-transparent -z-10" />
      <Header />
      <div className="flex justify-center relative">
        <main className="w-full max-w-7xl px-4 py-8">
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList className="glass">
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="stocks">Gestion des stocks</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory">
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="glass p-6 rounded-xl sticky top-4">
                    <h2 className="text-xl font-semibold mb-4">Ajouter un objet</h2>
                    <ItemForm />
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <ItemList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stocks">
              <StockManagementPage />
            </TabsContent>

            <TabsContent value="history">
              <HistoryPage />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </div>
  );
}