import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiLogOut, FiUpload, FiZap } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <div className="navbar-logo-icon"><FiZap /></div>
        <span className="navbar-brand-name">LinkSnap</span>
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard" className={`navbar-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <FiGrid size={15} />
          Dashboard
        </Link>
        <Link to="/bulk" className={`navbar-link ${location.pathname === "/bulk" ? "active" : ""}`}>
          <FiUpload size={15} />
          Bulk Upload
        </Link>
      </div>

      <div className="navbar-user">
        <span className="navbar-username">{user?.name}</span>
        <div className="navbar-avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
          <FiLogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
