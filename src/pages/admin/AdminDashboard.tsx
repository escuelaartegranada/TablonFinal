import { useAppStore } from '../../store/useAppStore';
import { Link } from 'react-router-dom';
import { Megaphone, CheckCircle2, Clock, XCircle, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const announcements = useAppStore((state) => state.announcements);

  const now = new Date();
  
  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.published && new Date(a.startAt) <= now && (!a.endAt || new Date(a.endAt) >= now)).length,
    scheduled: announcements.filter(a => a.published && new Date(a.startAt) > now).length,
    expired: announcements.filter(a => a.endAt && new Date(a.endAt) < now).length,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Resumen</h1>
          <p className="text-muted-foreground mt-1">Estado actual del tablón digital</p>
        </div>
        <Link 
          to="/admin/anuncios/nuevo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Nuevo Anuncio
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Anuncios" 
          value={stats.total} 
          icon={Megaphone} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
        />
        <StatCard 
          title="Activos Ahora" 
          value={stats.active} 
          icon={CheckCircle2} 
          color="text-green-500" 
          bg="bg-green-500/10" 
        />
        <StatCard 
          title="Programados" 
          value={stats.scheduled} 
          icon={Clock} 
          color="text-amber-500" 
          bg="bg-amber-500/10" 
        />
        <StatCard 
          title="Caducados" 
          value={stats.expired} 
          icon={XCircle} 
          color="text-red-500" 
          bg="bg-red-500/10" 
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 mt-4">
        <h2 className="text-xl font-display font-semibold mb-4">Anuncios Activos</h2>
        {stats.active === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay anuncios mostrándose en la pantalla actualmente.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements
              .filter(a => a.published && new Date(a.startAt) <= now && (!a.endAt || new Date(a.endAt) >= now))
              .sort((a, b) => b.priority - a.priority)
              .map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span 
                      className="font-medium"
                      dangerouslySetInnerHTML={{ __html: a.title }}
                    />
                  </div>
                  <Link to={`/admin/anuncios/${a.id}`} className="text-sm text-primary hover:underline">
                    Editar
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
      </div>
    </div>
  );
}
