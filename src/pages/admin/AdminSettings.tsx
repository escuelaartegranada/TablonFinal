import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save, MonitorPlay } from 'lucide-react';

export default function AdminSettings() {
  const { settings, updateSettings } = useAppStore();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Configuración de Pantalla</h1>
        <p className="text-muted-foreground mt-1">Ajusta cómo se muestran los anuncios en el tablón público.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border flex flex-col gap-8">
        
        {/* Display Mode */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-display font-semibold border-b border-border pb-2">Modo de Visualización</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.displayMode === 'rotation' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  name="displayMode" 
                  value="rotation"
                  checked={formData.displayMode === 'rotation'}
                  onChange={(e) => setFormData({...formData, displayMode: e.target.value as any})}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-semibold">Rotación Automática</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">Muestra un anuncio a la vez, cambiando automáticamente después de un tiempo definido.</p>
            </label>

            <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.displayMode === 'list' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  name="displayMode" 
                  value="list"
                  checked={formData.displayMode === 'list'}
                  onChange={(e) => setFormData({...formData, displayMode: e.target.value as any})}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-semibold">Listado Continuo</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">Muestra todos los anuncios activos apilados verticalmente.</p>
            </label>
          </div>
        </div>

        {/* Timings (Only if rotation) */}
        {formData.displayMode === 'rotation' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-display font-semibold border-b border-border pb-2">Tiempos y Transiciones</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Duración por Anuncio (segundos)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={formData.rotationDuration}
                  onChange={(e) => setFormData({...formData, rotationDuration: parseInt(e.target.value) || 10})}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Recomendado: 8s - 15s para permitir escanear el QR.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Transición</label>
                <select
                  value={formData.transitionType}
                  onChange={(e) => setFormData({...formData, transitionType: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                >
                  <option value="fade-up">Fade + Desplazamiento Suave (Recomendado)</option>
                  <option value="crossfade">Crossfade Simple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duración de Transición (milisegundos)</label>
                <input
                  type="number"
                  min="300"
                  max="2000"
                  step="100"
                  value={formData.transitionDuration}
                  onChange={(e) => setFormData({...formData, transitionDuration: parseInt(e.target.value) || 800})}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Recomendado: 500ms - 900ms para un efecto premium.</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <MonitorPlay size={16} />
              Los cambios se aplicarán inmediatamente en la pantalla pública.
            </div>
            <div className="flex items-center gap-4">
              {saved && <span className="text-green-500 font-medium text-sm animate-in fade-in">¡Guardado!</span>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
