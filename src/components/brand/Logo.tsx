import clsx from "clsx";

/** Four pointed nova star with a play triangle cut out of its core. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="np-mark" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B0FF" />
          <stop offset="0.55" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#4DA8FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#np-mark)"
        fillRule="evenodd"
        d="M16 1C17.500 9 23 14.500 31 16C23 17.500 17.500 23 16 31C14.500 23 9 17.500 1 16C9 14.500 14.500 9 16 1ZM13.400 11.600v8.800l7.400-4.400Z"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display font-semibold tracking-[0.04em]", className)}>
      NOVA<span className="text-brand">PLAY</span>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-7 w-7" />
      <Wordmark className="text-[17px]" />
    </span>
  );
}
