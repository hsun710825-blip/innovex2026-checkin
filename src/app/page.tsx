import CheckInForm from "@/components/CheckInForm";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-teal-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-ocean-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium tracking-widest text-teal-300/80 uppercase">
            InnoVex 2026
          </p>
          <h1 className="text-2xl leading-tight font-bold text-white sm:text-3xl">
            基隆主題館開幕儀式
          </h1>
          <p className="mt-3 text-ocean-200/80">貴賓數位簽到</p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" />
        </header>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <CheckInForm />
        </div>

        <p className="mt-6 text-center text-xs text-ocean-300/50">
          請使用手機填寫並手寫簽名完成簽到
        </p>
      </div>
    </main>
  );
}
