import { ClipboardCheck, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signup(form);
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
          <UsersRound size={18} />
          Team Onboarding
        </div>
        <h1>Bring your office workflow into one shared task desk.</h1>
        <p>
          Create an admin account to manage projects or join as a member to focus
          only on the work assigned to you.
        </p>
        <div className="showcase-list">
          <span>Admin controls</span>
          <span>Member dashboards</span>
          <span>Live project boards</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-heading">
          <ClipboardCheck size={34} />
          <div>
            <h1>Create account</h1>
            <p>Choose Admin to manage projects, or Member for assigned work.</p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error ? <div className="alert error">{error}</div> : null}
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
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
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option>Member</option>
              <option>Admin</option>
            </select>
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="auth-note">
          <ShieldCheck size={16} />
          Passwords are hashed before storage.
        </div>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
