import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AnnouncementDetail() {
  const { slug } = useParams<{ slug: string }>();
  const announcements = useAppStore((state) => state.announcements);
  
  const announcement = announcements.find((a) => a.slug === slug);

  if (!announcement) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Anuncio no encontrado</h1>
        <p className="text-muted-foreground mb-8">El anuncio que buscas no existe o ha caducado.</p>
        <Link to="/" className="text-primary font-medium hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10 px-6 py-4 flex items-center">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="font-display font-semibold text-lg truncate">Detalle del Anuncio</div>
      </header>

      {/* Hero Image (if any) */}
      {announcement.imageUrl && (
        <div className="w-full aspect-video bg-muted relative overflow-hidden">
          <img 
            src={announcement.imageUrl} 
            alt={announcement.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto">
        {announcement.category && (
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
            {announcement.category}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4 text-balance">
          {announcement.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Calendar size={16} />
          <span>Publicado el {format(new Date(announcement.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</span>
        </div>

        {announcement.summary && (
          <p className="text-xl font-light text-foreground/80 leading-relaxed mb-8 text-balance">
            {announcement.summary}
          </p>
        )}

        {announcement.content && (
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none mb-12">
            {announcement.content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        )}

        {announcement.targetUrl && (
          <a 
            href={announcement.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Más información <ExternalLink size={20} />
          </a>
        )}
      </main>
    </div>
  );
}
