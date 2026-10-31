import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { loginAccount } from "../lib/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await loginAccount(email, password);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">

      <div className="registration-card">

        <div className="logo">H</div>

        <p className="subtitle">WELCOME BACK</p>

        <h1>Login to HiPATH</h1>

        <p className="description">
          Enter your account details to continue.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label htmlFor="login-email">Email ID</label>

            <div className="input-box">
              <Mail size={20} />

              <input
                type="email"
                id="login-email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Login →"}
          </button>

        </form>

        <p className="login-text">
          New to HiPATH?{" "}
          <span onClick={() => navigate("/director")}>
            Sign up
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;
