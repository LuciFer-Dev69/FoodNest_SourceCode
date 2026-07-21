import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface HeroSlide {
  image: string;
  title: string;
  description: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  interval?: number;
}

const STATS = [
  { icon: "🌱", value: "12 kg", label: "Food Saved" },
  { icon: "❤️", value: "42", label: "Meals Shared" },
  { icon: "♻️", value: "86%", label: "Waste Reduced" },
];

function preloadImage(src: string) {
  const img = new Image();
  img.src = src;
}

export function HeroCarousel({ slides, interval = 6000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    preloadImage(slides[(index + 1) % slides.length].image);
  }, [slides]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    preloadImage(slides[1].image);
  }, [slides]);

  useEffect(() => {
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [next, interval]);

  const slide = slides[current];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            loading={current === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
        <div className="flex items-start justify-between">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Live impact
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-3"
          >
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              {slide.title}
            </h2>
            <p className="max-w-md text-sm text-white/80 md:text-base">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-3 text-center backdrop-blur-md"
              >
                <span className="text-lg">{stat.icon}</span>
                <p className="mt-0.5 text-sm font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
