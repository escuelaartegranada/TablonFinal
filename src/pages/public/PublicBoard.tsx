import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../store/useAppStore';
import { Announcement } from '../../types';

export default function PublicBoard() {
  const { announcements, settings } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter active announcements
  const activeAnnouncements = useMemo(() => {
    const now = new Date();
    return announcements
      .filter((a) => {
        if (!a.published) return false;
        const start = new Date(a.startAt);
        if (start > now) return false;
        if (a.endAt) {
          const end = new Date(a.endAt);
          if (end < now) return false;
        }
        return true;
      })
      .sort((a, b) => b.priority - a.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [announcements]);

  // Rotation logic
  useEffect(() => {
    if (settings.displayMode !== 'rotation' || activeAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, settings.rotationDuration * 1000);

    return () => clearInterval(interval);
  }, [settings.displayMode, settings.rotationDuration, activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-8">
        <div className="text-white/50 text-2xl font-display tracking-tight">
          No hay anuncios activos
        </div>
      </div>
    );
  }

  const currentAnnouncement = activeAnnouncements[currentIndex];

  // Animation variants based on settings
  const variants = {
    'fade-up': {
      initial: { opacity: 0, y: 40, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -40, scale: 0.98 },
    },
    'crossfade': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  };

  const selectedVariant = variants[settings.transitionType] || variants['fade-up'];
  const transition = { duration: settings.transitionDuration / 1000, ease: [0.22, 1, 0.36, 1] };

  // Get the base URL for the QR code
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  return (
    <div className="min-h-screen bg-primary text-white overflow-hidden flex flex-col relative">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red-light/20 to-brand-red-dark/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Header / Branding */}
      <header className="p-6 md:p-10 flex justify-between items-center z-10">
        <div className="text-2xl md:text-3xl font-display font-bold tracking-tighter">
          TABLÓN<span className="opacity-50 font-light">DIGITAL</span>
        </div>
        <div className="text-white/60 text-lg md:text-xl font-mono">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 z-10">
        {settings.displayMode === 'rotation' ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAnnouncement.id}
              initial={selectedVariant.initial}
              animate={selectedVariant.animate}
              exit={selectedVariant.exit}
              transition={transition}
              className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-16 shadow-2xl flex flex-col gap-8 md:gap-12"
            >
              {currentAnnouncement.category && (
                <div className="self-start px-4 py-1.5 rounded-full border border-white/20 text-xs md:text-sm font-medium tracking-widest uppercase text-white/80">
                  {currentAnnouncement.category}
                </div>
              )}
              
              <div className="flex flex-col gap-4 md:gap-6">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-semibold leading-[1.1] tracking-tight text-balance">
                  {currentAnnouncement.title}
                </h1>
                {currentAnnouncement.summary && (
                  <p className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light leading-relaxed text-balance">
                    {currentAnnouncement.summary}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-8 md:pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-white/10 gap-6 sm:gap-0">
                <div className="flex flex-col gap-2 max-w-full sm:max-w-[60%]">
                  <span className="text-base md:text-lg text-white/60 font-medium">Escanea para más detalles</span>
                  <span className="text-xs md:text-sm text-white/40 font-mono break-all">{baseUrl}/anuncio/{currentAnnouncement.slug}</span>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-xl self-center sm:self-auto">
                  <QRCodeSVG 
                    value={`${baseUrl}/anuncio/${currentAnnouncement.slug}`} 
                    size={120}
                    className="w-24 h-24 md:w-40 md:h-40"
                    level="H"
                    includeMargin={false}
                    fgColor="#cc0000"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex flex-col gap-6 md:gap-8 overflow-y-auto pb-20 pr-2 md:pr-4 custom-scrollbar">
            {activeAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center"
              >
                <div className="flex-1 flex flex-col gap-3 md:gap-4">
                  {announcement.category && (
                    <span className="text-xs font-medium tracking-widest uppercase text-white/60">
                      {announcement.category}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold leading-tight">
                    {announcement.title}
                  </h2>
                  {announcement.summary && (
                    <p className="text-lg md:text-xl text-white/70 font-light line-clamp-2">
                      {announcement.summary}
                    </p>
                  )}
                </div>
                <div className="bg-white p-3 rounded-xl shrink-0 self-center sm:self-auto">
                  <QRCodeSVG 
                    value={`${baseUrl}/anuncio/${announcement.slug}`} 
                    size={80}
                    className="w-20 h-20 md:w-[100px] md:h-[100px]"
                    level="M"
                    fgColor="#cc0000"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Progress Indicator for Rotation */}
      {settings.displayMode === 'rotation' && activeAnnouncements.length > 1 && (
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-20">
          <motion.div 
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: settings.rotationDuration, ease: "linear" }}
            className="h-full bg-white/80"
          />
        </div>
      )}
    </div>
  );
}
