import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { loginAccount, loginWithGoogle } from "../lib/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await loginAccount(email, password);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    let cancelled = false;
    const initialize = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError("");
          try {
            await loginWithGoogle(credential);
            navigate("/dashboard");
          } catch (loginError) {
            setError(loginError.message);
          }
        },
      });
      const button = document.getElementById("google-signin-button");
      if (button) window.google.accounts.id.renderButton(button, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 360,
      });
    };

    if (window.google?.accounts?.id) {
      initialize();
      return () => { cancelled = true; };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => setError("Could not load Google sign-in. Check your internet connection and try again.");
    document.head.appendChild(script);
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="registration-container">
      <div className="registration-card login-card">
        <div className="logo">H</div>
        <p className="subtitle">WELCOME BACK</p>
        <h1>Login to HiPATH</h1>
        <p className="description">Sign in with your email and password or continue with Google.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email ID</label>
            <div className="input-box">
              <Mail size={20} />
              <input
                type="email"
                id="login-email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-box">
              <Lock size={20} />
              <input
                type="password"
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="submit-button">Login →</button>
        </form>

        <div className="login-divider"><span>OR</span></div>

        <div id="google-signin-button" className="google-signin-button" />
        {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <p className="google-setup-note">Google sign-in is unavailable until VITE_GOOGLE_CLIENT_ID is configured.</p>
        )}

        <p className="login-text">
          New to HiPATH?{" "}
          <span onClick={() => navigate("/director")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
