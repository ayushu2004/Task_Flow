import {
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <BriefcaseBusiness size={22} />
          </span>
          <div>
            <strong>Team Task Manager</strong>
            <span>Office Operations</span>
          </div>
        </div>

        <div className="office-card">
          <Building2 size={20} />
          <div>
            <strong>Head Office</strong>
            <span>{user.role} workspace</span>
          </div>
        </div>

        <nav className="nav-links">
          <NavLink to="/">
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={18} />
            Projects
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <span>Search projects, tasks, or teammates</span>
          </div>
          <div className="topbar-user">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
