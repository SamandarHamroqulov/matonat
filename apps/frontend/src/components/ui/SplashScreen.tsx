// src/components/ui/SplashScreen.tsx
// Full screen branded loading screen with animated M logo
// Used as: initial auth check + Suspense fallback
interface SplashScreenProps {
  variant?: 'full' | 'inline'
}

function LogoMark() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <style>{`
        @keyframes spin-arc {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(0.97) }
          50% { transform: scale(1.0) }
        }
      `}</style>

      <svg
        aria-hidden="true"
        className="absolute inset-0"
        viewBox="0 0 96 96"
        width="96"
        height="96"
        style={{ animation: 'spin-arc 1.8s linear infinite' }}
      >
        <circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="#FCD34D"
          strokeOpacity="0.4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60 220"
        />
      </svg>

      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg shadow-black/20"
        style={{ animation: 'logo-pulse 2s ease-in-out infinite' }}
      >
        <span
          className="text-3xl font-bold leading-none text-white"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          M
        </span>
      </div>
    </div>
  )
}

export default function SplashScreen({ variant = 'full' }: SplashScreenProps) {
  const isFull = variant === 'full'

  return (
    <div
      className={
        isFull
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#0F2347]'
          : 'flex min-h-[200px] items-center justify-center bg-transparent'
      }
    >
      <div className="flex flex-col items-center justify-center">
        <LogoMark />

        {isFull ? (
          <>
            <div className="mt-6 text-lg font-light tracking-[0.25em] text-white">
              MATONAT
            </div>
            <div className="mt-1 text-xs tracking-[0.15em] text-gray-400">
              O&apos;quv markazi
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
