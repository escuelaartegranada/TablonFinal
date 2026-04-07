import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { generateSlug } from '../../lib/utils';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminAnnouncementForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { announcements, addAnnouncement, updateAnnouncement } = useAppStore();
  
  const isEditing = Boolean(id && id !== 'nuevo');
  const existingAnnouncement = isEditing ? announcements.find(a => a.id === id) : null;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    targetUrl: '',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: '',
    published: true,
    priority: 0,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingAnnouncement) {
      setFormData({
        title: existingAnnouncement.title,
        slug: existingAnnouncement.slug,
        summary: existingAnnouncement.summary || '',
        content: existingAnnouncement.content || '',
        category: existingAnnouncement.category || '',
        imageUrl: existingAnnouncement.imageUrl || '',
        targetUrl: existingAnnouncement.targetUrl || '',
        startAt: new Date(existingAnnouncement.startAt).toISOString().slice(0, 16),
        endAt: existingAnnouncement.endAt ? new Date(existingAnnouncement.endAt).toISOString().slice(0, 16) : '',
        published: existingAnnouncement.published,
        priority: existingAnnouncement.priority,
      });
    }
  }, [existingAnnouncement]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug only if we are creating new or slug is empty
      slug: (!isEditing || !prev.slug) ? generateSlug(title) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
      };

      if (isEditing && id) {
        await updateAnnouncement(id, dataToSave);
      } else {
        await addAnnouncement(dataToSave);
      }
      
      navigate('/admin/anuncios');
    } catch (err: any) {
      console.error(err);
      if (err.code === '23505') {
        setError('Ya existe un anuncio con ese slug. Por favor, cambia el título o el slug.');
      } else {
        setError(err.message || 'Ocurrió un error al guardar el anuncio. Revisa la configuración de tu base de datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const previewUrl = `${baseUrl}/anuncio/${formData.slug || 'preview'}`;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/anuncios" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col gap-4">
            <h2 className="text-xl font-display font-semibold border-b border-border pb-2">Información Principal</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                placeholder="Ej. Jornada de Puertas Abiertas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL amigable) *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resumen (Para la pantalla pública)</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 resize-none h-24"
                placeholder="Texto breve que aparecerá en la pantalla grande..."
                maxLength={150}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">{formData.summary.length}/150</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contenido Completo (Para la página web)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50 resize-y min-h-[200px]"
                placeholder="Detalles completos que verá el usuario al escanear el QR..."
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col gap-4">
            <h2 className="text-xl font-display font-semibold border-b border-border pb-2">Multimedia y Enlaces</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoría / Etiqueta</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                placeholder="Ej. Eventos, Formación, Aviso..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL de Imagen (Opcional)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL Externa (Botón CTA)</label>
              <input
                type="url"
                value={formData.targetUrl}
                onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                placeholder="https://ejemplo.com/mas-info"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Fields & Preview */}
        <div className="flex flex-col gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col gap-4">
            <h2 className="text-xl font-display font-semibold border-b border-border pb-2">Publicación</h2>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="published" className="font-medium">Publicado (Visible)</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Inicio *</label>
              <input
                type="datetime-local"
                required
                value={formData.startAt}
                onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Fin (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({...formData, endAt: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridad (Mayor = Primero)</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Anuncio')}
            </button>
          </div>

          {/* QR Preview */}
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-display font-semibold w-full text-left border-b border-border pb-2">Vista Previa QR</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={previewUrl} 
                size={150}
                level="M"
                fgColor="#cc0000"
              />
            </div>
            <p className="text-xs text-muted-foreground break-all font-mono">
              {previewUrl}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
