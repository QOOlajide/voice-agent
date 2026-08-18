const STEPS = [
  {
    title: "1. Step In",
    body: "Transition to a sensory-isolated audio workspace.",
  },
  {
    title: "2. Listen & Speak",
    body: "Focus purely on auditory learning. No text subtitles while conversing.",
  },
  {
    title: "3. Reflect",
    body: "Instantly review your full Arabic script transcript and tailored grammar fixes post-session.",
  },
] as const;

type WelcomeScreenProps = {
  onBeginSession: () => void;
};

export function WelcomeScreen({ onBeginSession }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-black p-8 font-sans text-white">
      <header className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium tracking-wide text-white">Kalam AI</span>
        <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-center text-[11px] font-light tracking-wide text-zinc-300">
          الفصحى & Dialects Supported
        </span>
      </header>

      <main className="flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight md:text-6xl">
          Speak Arabic. No Crutches.
        </h1>
        <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-zinc-400 md:text-base">
          An immersive, voice-only playground. Speak uninterrupted, review your
          transcript and grammar analysis afterward.
        </p>

        <div className="mx-auto my-12 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left"
            >
              <h2 className="text-sm font-medium tracking-wide text-white">{step.title}</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400">{step.body}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onBeginSession}
          className="rounded-full border border-emerald-400/80 bg-black px-8 py-3 text-base font-medium tracking-wide text-white shadow-[0_0_28px_rgba(16,185,129,0.55)] transition-shadow hover:shadow-[0_0_36px_rgba(52,211,153,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
        >
          ابدأ الجلسة (Begin Session)
        </button>
      </main>

      <div aria-hidden className="h-5" />
    </div>
  );
}
