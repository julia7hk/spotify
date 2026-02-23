import Image from "next/image";
import type { UserProfile } from "@/types/spotify";

interface ProfileHeaderProps {
  profile: UserProfile;
  playlistCount: number;
  onLogout: () => void;
}

export function ProfileHeader({
  profile,
  playlistCount,
  onLogout,
}: ProfileHeaderProps) {
  return (
    <header className="relative bg-gradient-to-b from-[#FFA69E]/30 to-transparent -mx-8 -mt-8 px-8 pt-10 pb-8 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover shadow-2xl border-2 border-[#FFA69E]/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#AED9E0] flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-[#5E6472]">{profile.name?.[0]}</span>
            </div>
          )}
          <div>
            <p className="text-sm text-[#AED9E0] uppercase tracking-wider font-medium">
              Profile
            </p>
            <h1 className="text-4xl font-bold mt-1">{profile.name}</h1>
            <p className="text-[#AED9E0] text-sm mt-1">
              {profile.followers.toLocaleString()} followers {" · "}
              {playlistCount} playlists
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-[#AED9E0] hover:text-[#FAF3DD] transition-colors text-sm font-medium border border-[#AED9E0] hover:border-[#FAF3DD] rounded-full px-4 py-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
