import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Search, AlertTriangle, QrCode, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast-provider';

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  location?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/inventory?search=${search}&lowStock=${showLowStock}`)
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, showLowStock]);

  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">إدارة المخزون</h1>
              <p className="text-sm text-muted-foreground">تتبع المواد والأدوات المدرسية</p>
            </div>
          </div>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} عنصر نفد
            </div>
          )}
        </div>

        <GlassCard className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث في المخزون..."
                className="pr-10"
              />
            </div>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              {showLowStock ? 'عرض الكل' : 'النفاد فقط'}
            </Button>
            <Button variant="outline" className="gap-2">
              <QrCode className="w-4 h-4" />
              مسح QR
            </Button>
          </div>
        </GlassCard>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const isLow = item.quantity <= item.minThreshold;
              const pct = Math.min((item.quantity / (item.minThreshold * 2)) * 100, 100);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-4 rounded-xl border transition-colors ${
                    isLow ? 'bg-red-500/5 border-red-500/20' : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isLow ? 'bg-red-500/15 text-red-500' : 'bg-primary/10 text-primary'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.code} · {item.category}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-foreground'}`}>
                        {item.quantity} {item.unit}
                      </p>
                      <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                لا توجد عناصر في المخزون
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
