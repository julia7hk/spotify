export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-3 border-[#FFA69E] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#AED9E0] text-sm">Loading your music...</p>
    </div>
  );
}
