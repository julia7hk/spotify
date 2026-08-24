import Image from "next/image";
import type { UserProfile } from "@/types/spotify";

interface ProfileHeaderProps {
  profile: UserProfile;
  playlistCount: number;
  savedCount?: number | null;
  onLogout: () => void;
}

export function ProfileHeader({
  profile,
  playlistCount,
  savedCount,
  onLogout,
}: ProfileHeaderProps) {
  const facts = [
    savedCount != null && `${savedCount.toLocaleString()} saved`,
    `${playlistCount} playlists`,
    `${profile.followers.toLocaleString()} followers`,
  ].filter(Boolean) as string[];

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-border pb-8">
      <div className="flex items-center gap-5">
        {profile.image ? (
          <Image
            src={profile.image}
            alt=""
            width={72}
            height={72}
            className="rounded-full object-cover ring-1 ring-border"
            style={{ width: 72, height: 72 }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-full bg-accent-soft text-2xl font-bold text-accent"
            style={{ width: 72, height: 72 }}
            aria-hidden
          >
            {profile.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Listening dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {profile.name}
          </h1>
          <p className="mt-1.5 text-sm text-muted tabular">
            {facts.join(" · ")}
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-ink"
      >
        Log out
      </button>
    </header>
  );
}
