import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Navigation, Camera } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ROOMS = [
  { id: 1, name: 'قاعة 101', type: 'class', x: 20, y: 30 },
  { id: 2, name: 'قاعة 102', type: 'class', x: 50, y: 30 },
  { id: 3, name: 'معمل العلوم', type: 'lab', x: 80, y: 30 },
  { id: 4, name: 'مكتبة', type: 'library', x: 20, y: 60 },
  { id: 5, name: 'صالة رياضية', type: 'gym', x: 60, y: 70 },
  { id: 6, name: 'مقصف', type: 'cafe', x: 85, y: 60 },
];

const TYPE_COLORS: Record<string, string> = {
  class: '#00C2FF',
  lab: '#22C55E',
  library: '#A855F7',
  gym: '#F59E0B',
  cafe: '#EC4899',
};

export default function CampusMapPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [arMode, setArMode] = useState(false);

  const filtered = search
    ? ROOMS.filter(r => r.name.includes(search))
    : ROOMS;

  const selRoom = ROOMS.find(r => r.id === selected);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">خريطة المدرسة</h1>
              <p className="text-sm text-muted-foreground">تصفح المواقع والقاعات</p>
            </div>
          </div>
          <Button
            variant={arMode ? 'default' : 'outline'}
            onClick={() => setArMode(!arMode)}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            {arMode ? 'إيقاف AR' : 'وضع AR'}
          </Button>
        </div>

        <GlassCard className="p-4 mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن قاعة أو معلم..."
              className="pr-10"
            />
          </div>
        </GlassCard>

        {arMode ? (
          <GlassCard className="p-8 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground mb-2">وضع الواقع المعزز</p>
            <p className="text-xs text-muted-foreground/60">افتح الكاميرا ووجهها نحو المدرسة لرؤية الاتجاهات</p>
            <div className="mt-6 inline-block">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-spin-slow" />
                <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 relative overflow-hidden">
            {/* SVG Floor Plan */}
            <svg viewBox="0 0 100 100" className="w-full h-auto" style={{ maxHeight: '500px' }}>
              {/* Background grid */}
              {Array.from({ length: 10 }).map((_, i) => (
                <g key={i}>
                  <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.3" />
                  <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.3" />
                </g>
              ))}

              {/* Walls */}
              <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" rx="2" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />

              {/* Rooms */}
              {filtered.map(room => {
                const isSelected = selected === room.id;
                const color = TYPE_COLORS[room.type] || '#888';
                return (
                  <g
                    key={room.id}
                    onClick={() => setSelected(room.id)}
                    className="cursor-pointer"
                  >
                    <motion.circle
                      cx={room.x}
                      cy={room.y}
                      r={isSelected ? 8 : 6}
                      fill={color}
                      fillOpacity={isSelected ? 0.3 : 0.15}
                      stroke={color}
                      strokeWidth={isSelected ? 1 : 0.5}
                      animate={{ r: isSelected ? 8 : 6 }}
                    />
                    <text
                      x={room.x}
                      y={room.y + 12}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="3"
                      opacity={0.8}
                    >
                      {room.name}
                    </text>
                  </g>
                );
              })}

              {/* Path to selected */}
              {selRoom && (
                <motion.line
                  x1="50"
                  y1="95"
                  x2={selRoom.x}
                  y2={selRoom.y}
                  stroke="#00C2FF"
                  strokeWidth="1"
                  strokeDasharray="2 1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              )}
            </svg>

            {selRoom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{selRoom.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selRoom.type === 'class' ? 'قاعة دراسية'
                        : selRoom.type === 'lab' ? 'معمل'
                        : selRoom.type === 'library' ? 'مكتبة'
                        : selRoom.type === 'gym' ? 'صالة رياضية'
                        : 'مقصف'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Navigation className="w-3 h-3" /> ابدأ الملاحة
                  </Button>
                </div>
              </motion.div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
