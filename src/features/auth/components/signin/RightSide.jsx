import { useMemo } from "react";
import { useLocale } from "../../../../contexts/LocaleContext";

function RightSide() {
  const { t } = useLocale();
  // Generate deterministic decorative dot positions once per mount
  const dots = useMemo(() => {
    const seed = 12345; // deterministic seed
    const rand = (i) => {
      // simple pseudo-random using seed and index
      const x = Math.sin(seed + i * 999) * 10000;
      return x - Math.floor(x);
    };

    const arr = [];
    for (let i = 0; i < 18; i++) {
      const left = Math.floor(5 + rand(i) * 90); // percent
      const top = Math.floor(5 + rand(i + 1) * 90);
      const size = Math.ceil(1 + rand(i + 2) * 3); // 1..4 px base
      const opacity = 0.25 + rand(i + 3) * 0.7;
      const delay = Math.floor(rand(i + 4) * 8000); // ms
      arr.push({ left, top, size, opacity, delay });
    }
    return arr;
  }, []);

  return (
    <div className="hidden lg:flex relative min-h-screen overflow-hidden w-full">
      {/* Enhanced blue background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B24] via-[#0B3B24] to-[#14532D] animate-slow-pulse"></div>

      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50 animate-float motion-reduce:animate-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-30 motion-reduce:opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl opacity-40 motion-reduce:opacity-40"></div>

        {/* Floating feature cards */}
        <div className="absolute top-20 left-12 w-40 h-28 bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col justify-center gap-1 transform-gpu animate-float motion-reduce:animate-none">
          <div className="h-3 bg-white/30 rounded w-2/3" />
          <div className="h-2 bg-white/20 rounded w-1/2" />
        </div>

        <div className="absolute right-16 top-40 w-36 h-24 bg-white/8 border border-white/15 rounded-2xl p-3 flex items-center justify-center transform-gpu animate-blob motion-reduce:animate-none">
          <svg
            className="w-8 h-8 text-white opacity-90 animate-spin-slow motion-reduce:animate-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeWidth={1.5}
              stroke="currentColor"
              className="opacity-40"
            />
          </svg>
        </div>

        {/* Animated dot trail */}
        <div className="absolute left-1/4 bottom-40 flex flex-col gap-3">
          <div className="w-2 h-2 bg-white/80 rounded-full animate-ping motion-reduce:animate-none"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse motion-reduce:animate-none delay-200"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce motion-reduce:animate-none delay-400"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 p-12 flex flex-col justify-center items-center w-full text-white text-center animate-fade-in-up">
        {/* Logo/Brand Section */}
        <div className="mb-12 isolate">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center border border-white/30 mb-6 mx-auto">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white">{t('signin.brandName')}</h1>
          <p className="text-xl text-white opacity-90">
            {t('signin.brandTagline')}
          </p>
        </div>

        {/* Main Features - Fast, Easy and Secure */}
        <div className="space-y-8 mb-16">
          <div className="flex items-center space-x-6 bg-white/15 rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">{t('signin.fast')}</h3>
              <p className="text-white opacity-80 text-lg">
                {t('signin.fastDescription')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-white/15 rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">{t('signin.easy')}</h3>
              <p className="text-white opacity-80 text-lg">
                {t('signin.easyDescription')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-white/15 rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">{t('signin.secure')}</h3>
              <p className="text-white opacity-80 text-lg">
                {t('signin.secureDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/30 w-full max-w-md">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">2K+</div>
            <div className="text-white/80">{t('signin.lots')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-white/80">{t('signin.uptime')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/80">{t('signin.support')}</div>
          </div>
        </div>
        {/* Random decorative dots - purely visual */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          {dots.map((d, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-white motion-reduce:opacity-100 animate-float motion-reduce:animate-none"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                opacity: d.opacity,
                transform: "translate(-50%, -50%)",
                willChange: "transform, opacity",
                animationDelay: `${d.delay}ms`,
                animationDuration: `${4000 + d.size * 600}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RightSide;
