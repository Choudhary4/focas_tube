import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { setAccessToken } from '../services/authStorage';

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      navigate('/playlists');
    },
    onError: () => {
      alert('Google login failed. Please try again.');
    },
  });

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-100 via-white to-cyan-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Focused Study</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">FocusTube</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Watch only your playlists. No recommendations, comments, or feed distractions.
        </p>
        <button
          onClick={() => login()}
          className="mt-8 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
