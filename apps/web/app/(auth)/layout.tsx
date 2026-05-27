export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-battle">
            StreamBattle
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Batalhas de presentes ao vivo
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
