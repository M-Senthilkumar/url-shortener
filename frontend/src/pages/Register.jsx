import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.user, res.data.token);
      toast.success(`Account created. Welcome, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const pwLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><FiZap /></div>
          <span className="auth-logo-name">LinkSnap</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start shortening links for free</p>

        <form onSubmit={handleRegister} noValidate>
          {error && (
            <div className="form-error auth-error">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <div className="input-icon-wrap">
              <FiUser className="input-leading-icon" size={15} />
              <input id="reg-name" type="text" className="form-input with-leading-icon" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-leading-icon" size={15} />
              <input id="reg-email" type="email" className="form-input with-leading-icon" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-leading-icon" size={15} />
              <input id="reg-password" type={showPw ? "text" : "password"} className="form-input with-leading-icon with-trailing-icon" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className="input-trailing-button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="password-meter">
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: i <= pwStrength ? pwColors[pwStrength] : "rgba(255,255,255,0.1)" }} />
                ))}
                <span style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</span>
              </div>
            )}
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? <><div className="spinner spinner-sm" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account? <Link to="/" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
