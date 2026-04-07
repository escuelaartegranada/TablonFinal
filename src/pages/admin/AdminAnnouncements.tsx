import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminAnnouncements() {
  const { announcements, deleteAnnouncement } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'expired' | 'draft'>('all');

  const now = new Date();

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const start = new Date(a.startAt);
    const end = a.endAt ? new Date(a.endAt) : null;

    switch (filter) {
      case 'active':
        return a.published && start <= now && (!end || end >= now);
      case 'scheduled':
        return a.published && start > now;
      case 'expired':
        return end && end < now;
      case 'draft':
        return !a.published;
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (a: any) => {
    if (!a.published) return <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">Borrador</span>;
    
    const start = new Date(a.startAt);
    const end = a.endAt ? new Date(a.endAt) : null;
    
    if (end && end < now) return <span className="px-2 py-1 rounded-md bg-red-100 text-red-600 text-xs font-medium">Caducado</span>;
    if (start > now) return <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-600 text-xs font-medium">Programado</span>;
    
    return <span className="px-2 py-1 rounded-md bg-green-100 text-green-600 text-xs font-medium">Activo</span>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-foreground">Anuncios</h1>
        <Link 
          to="/admin/anuncios/nuevo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={20} />
          Nuevo Anuncio
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar anuncios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {(['all', 'active', 'scheduled', 'expired', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {f === 'all' ? 'Todos' : 
               f === 'active' ? 'Activos' : 
               f === 'scheduled' ? 'Programados' : 
               f === 'expired' ? 'Caducados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 font-medium text-muted-foreground text-sm">Título</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Estado</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Inicio</th>
                <th className="p-4 font-medium text-muted-foreground text-sm">Fin</th>
                <th className="p-4 font-medium text-muted-foreground text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No se encontraron anuncios.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((a) => (
                  <tr key={a.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{a.title}</div>
                      {a.category && <div className="text-xs text-muted-foreground mt-1">{a.category}</div>}
                    </td>
                    <td className="p-4">{getStatusBadge(a)}</td>
                    <td className="p-4 text-sm">{format(new Date(a.startAt), "dd MMM yyyy, HH:mm", { locale: es })}</td>
                    <td className="p-4 text-sm">{a.endAt ? format(new Date(a.endAt), "dd MMM yyyy, HH:mm", { locale: es }) : '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/anuncio/${a.slug}`} 
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
                          title="Ver página pública"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link 
                          to={`/admin/anuncios/${a.id}`}
                          className="p-2 text-muted-foreground hover:text-blue-500 transition-colors rounded-lg hover:bg-secondary"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar este anuncio?')) {
                              deleteAnnouncement(a.id);
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-secondary"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
