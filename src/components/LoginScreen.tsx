import { SpotifyIcon } from "./SpotifyIcon";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="rise w-full max-w-md text-center">
        <div
          aria-hidden
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft"
        >
          <SpotifyIcon className="h-7 w-7 text-accent" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Listening Dashboard
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          Your top artists, tracks and library — across four weeks, six months,
          or all time. Any day you want, not once a year.
        </p>

        <button
          onClick={onLogin}
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent shadow-[var(--shadow-md)] transition-colors hover:bg-accent-hover active:bg-accent-press"
        >
          <SpotifyIcon className="h-4 w-4" />
          Connect with Spotify
        </button>
      </div>
    </div>
  );
}
