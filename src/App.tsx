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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10" />
      <div className="absolute inset-0 bg-gradient-radial-t from-purple-200/30 via-transparent to-transparent -z-10" />
      <Header />
      <div className="flex justify-center relative">
        <main className="w-full max-w-7xl px-4 py-8">
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList className="glass border border-purple-100/20 shadow-lg bg-white/60">
              <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-100/50 data-[state=active]:text-purple-900">Inventaire</TabsTrigger>
              <TabsTrigger value="stocks" className="data-[state=active]:bg-purple-100/50 data-[state=active]:text-purple-900">Gestion des stocks</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-100/50 data-[state=active]:text-purple-900">Historique</TabsTrigger>
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