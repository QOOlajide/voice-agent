export function CompletedScreen() {
  return (
    <div className="fixed inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-black font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.92)_100%)]" />
      <p className="relative text-sm font-light tracking-normal text-white/60">
        انتهت الجلسة
      </p>
    </div>
  );
}
