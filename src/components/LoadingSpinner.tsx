export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-3 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#b3b3b3] text-sm">Loading your music...</p>
    </div>
  );
}
