import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><FiZap /></div>
          <span className="auth-logo-name">LinkSnap</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your links</p>

        <form onSubmit={handleLogin} noValidate>
          {error && (
            <div className="form-error auth-error">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-leading-icon" size={15} />
              <input id="login-email" type="email" className="form-input with-leading-icon" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-leading-icon" size={15} />
              <input id="login-password" type={showPw ? "text" : "password"} className="form-input with-leading-icon with-trailing-icon" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="input-trailing-button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? <><div className="spinner spinner-sm" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          Don't have an account? <Link to="/register" className="auth-link">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
