export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-accent border-t-transparent" />
      <p className="text-sm text-muted">Loading your listening data…</p>
    </div>
  );
}
