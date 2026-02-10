import { SpotifyIcon } from "./SpotifyIcon";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SpotifyIcon className="w-12 h-12 text-[#1DB954]" />
          <h1 className="text-4xl font-bold">Spotify Dashboard</h1>
        </div>
        <p className="text-[#b3b3b3] text-lg">
          Your listening stats, all in one place
        </p>
      </div>
      <button
        onClick={onLogin}
        className="flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-4 px-8 rounded-full transition-all hover:scale-105"
      >
        <SpotifyIcon className="w-6 h-6" />
        Connect with Spotify
      </button>
    </div>
  );
}
