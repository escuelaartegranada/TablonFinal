# Propuesta Técnica: Tablón de Anuncios Digital (Digital Signage)

## 1. Resumen Ejecutivo
Esta solución proporciona un sistema completo de cartelería digital vertical (Digital Signage) compuesto por dos partes principales:
1. **Pantalla Pública (Kiosco)**: Optimizada para resolución vertical (1080x1920), muestra anuncios activos de forma rotativa o en listado continuo con animaciones premium y fluidas.
2. **Dashboard de Administración**: Un panel privado para gestionar el ciclo de vida de los anuncios (creación, edición, programación, eliminación) y configurar el comportamiento de la pantalla.

El diseño visual se centra en una estética corporativa premium con fondo rojo, tipografía moderna (Sora/Inter) y alta legibilidad.

## 2. Arquitectura Técnica Recomendada
Aunque este prototipo funcional utiliza almacenamiento local (Zustand + LocalStorage) para ejecución inmediata sin configuración, la arquitectura está diseñada para **Next.js + Supabase**:

*   **Frontend**: React (Next.js en producción, Vite en este prototipo).
*   **Estilos**: Tailwind CSS + shadcn/ui.
*   **Animaciones**: Framer Motion.
*   **Backend/BBDD**: Supabase (PostgreSQL + Auth).
*   **Despliegue**: Vercel (Frontend) + Supabase (Backend).

### Flujos Principales:
*   **Flujo de Publicación**: El admin crea un anuncio con `start_at` y `end_at`. El backend (o la lógica del store) filtra los anuncios donde `published == true` y la fecha actual está entre `start_at` y `end_at`.
*   **Flujo de Renderizado**: La pantalla pública hace polling o recibe eventos en tiempo real (Supabase Realtime) para actualizar la lista de anuncios activos.
*   **Flujo de Animación**: Un motor de rotación en el cliente cambia el índice del anuncio activo cada `X` segundos, disparando transiciones de Framer Motion (Fade + Slight Upward Motion).

## 3. Estructura de Carpetas (Prototipo)
```text
/src
  /components
    /admin       # Componentes del dashboard
    /public      # Componentes de la pantalla pública
    /ui          # Componentes genéricos (botones, inputs, tarjetas)
  /store         # Estado global (Zustand)
  /types         # Definiciones de TypeScript
  /utils         # Funciones de ayuda (formato de fechas, cn)
  App.tsx        # Enrutador principal
```

## 4. Esquema SQL de la Base de Datos (Supabase PostgreSQL)

```sql
-- Tabla de Usuarios (Extendiendo auth.users de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Anuncios
CREATE TABLE public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_mode TEXT DEFAULT 'rotation', -- 'rotation' | 'list'
  rotation_duration INTEGER DEFAULT 10, -- segundos
  transition_duration INTEGER DEFAULT 800, -- milisegundos
  transition_type TEXT DEFAULT 'fade-up', -- 'fade-up' | 'crossfade'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX idx_announcements_active ON public.announcements(published, start_at, end_at);
CREATE INDEX idx_announcements_slug ON public.announcements(slug);
```

## 5. Instrucciones de Despliegue (Producción)
1.  **Supabase**: Crear un proyecto, ejecutar el script SQL anterior y configurar las políticas RLS (Row Level Security) para que solo los admins puedan escribir, y la lectura de anuncios activos sea pública.
2.  **Frontend (Vercel)**:
    *   Conectar el repositorio a Vercel.
    *   Configurar variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
    *   Desplegar.

## 6. Siguientes Pasos (Escalabilidad)
*   Soporte para múltiples pantallas (asignar anuncios a `screen_id`).
*   Playlists de anuncios.
*   Estadísticas de escaneo de QR (usando un acortador o tracking en la página de detalle).
