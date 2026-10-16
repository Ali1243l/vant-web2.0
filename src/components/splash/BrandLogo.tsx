// Same lockup as Header.tsx: both names always shown together, size set by the caller.
export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <div dir="ltr" className={`flex items-center gap-3 whitespace-nowrap leading-none ${className}`}>
      <span className="font-extrabold uppercase tracking-[0.28em] -me-[0.28em]">VANT</span>
      <span aria-hidden="true" className="h-[0.9em] w-px bg-current opacity-25" />
      <span className="font-bold tracking-[0.04em]">فانت</span>
    </div>
  );
}
