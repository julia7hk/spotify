import { SpotifyIcon } from "./SpotifyIcon";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SpotifyIcon className="w-12 h-12 text-[#FFA69E]" />
          <h1 className="text-4xl font-bold">Spotify Dashboard</h1>
        </div>
        <p className="text-[#AED9E0] text-lg">
          Your listening stats, all in one place
        </p>
      </div>
      <button
        onClick={onLogin}
        className="flex items-center gap-3 bg-[#FFA69E] hover:bg-[#B8F2E6] text-[#5E6472] font-semibold py-4 px-8 rounded-full transition-all hover:scale-105"
      >
        <SpotifyIcon className="w-6 h-6" />
        Connect with Spotify
      </button>
    </div>
  );
}
