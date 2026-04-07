import React from 'react';

export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-xl border border-border p-8 overflow-hidden">
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Configuración Requerida</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Para usar el backend real, necesitas configurar tu proyecto de Supabase.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Añade las variables de entorno
            </h2>
            <p className="text-muted-foreground mb-4">
              Abre el panel de <strong>Secrets</strong> en AI Studio y añade las siguientes variables con los valores de tu proyecto de Supabase:
            </p>
            <ul className="list-disc list-inside bg-secondary/50 p-4 rounded-xl font-mono text-sm border border-border">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Ejecuta el script SQL
            </h2>
            <p className="text-muted-foreground mb-4">
              Abre el <strong>SQL Editor</strong> en tu panel de Supabase y ejecuta el siguiente script para crear las tablas y políticas necesarias:
            </p>
            <div className="bg-secondary/50 p-4 rounded-xl border border-border overflow-x-auto">
              <pre className="text-sm font-mono text-foreground/80 whitespace-pre-wrap">
{`-- Tabla de Anuncios
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  target_url TEXT,
  start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at TIMESTAMPTZ,
  published BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Configuración de Pantalla
CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_mode TEXT DEFAULT 'rotation',
  rotation_duration INTEGER DEFAULT 10,
  transition_duration INTEGER DEFAULT 800,
  transition_type TEXT DEFAULT 'fade-up',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO public.settings (display_mode, rotation_duration, transition_duration, transition_type)
VALUES ('rotation', 10, 800, 'fade-up');

-- Habilitar RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas para anuncios (Lectura pública, escritura solo autenticados)
CREATE POLICY "Anuncios visibles para todos" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Anuncios insertables por admin" ON public.announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Anuncios editables por admin" ON public.announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Anuncios borrables por admin" ON public.announcements FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para configuración
CREATE POLICY "Configuración visible para todos" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Configuración editable por admin" ON public.settings FOR ALL USING (auth.role() = 'authenticated');`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Crea un usuario administrador
            </h2>
            <p className="text-muted-foreground">
              Ve a <strong>Authentication &gt; Users</strong> en Supabase y crea un usuario con tu email y contraseña. Usarás estas credenciales para acceder al panel de administración.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
