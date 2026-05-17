import { BriefcaseBusiness, ClipboardList, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="showcase-badge">
          <BriefcaseBusiness size={18} />
          Office Task Suite
        </div>
        <h1>Run projects like a calm, organized front office.</h1>
        <p>
          Centralize tasks, deadlines, and team ownership with a secure manager
          dashboard built for everyday coordination.
        </p>
        <div className="showcase-list">
          <span>Project briefs</span>
          <span>Role-based access</span>
          <span>Deadline tracking</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-heading">
          <ClipboardList size={34} />
          <div>
            <h1>Team Task Manager</h1>
            <p>Sign in to manage projects and assigned work.</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error ? <div className="alert error">{error}</div> : null}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-note">
          <ShieldCheck size={16} />
          JWT secured workspace with encrypted passwords.
        </div>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
