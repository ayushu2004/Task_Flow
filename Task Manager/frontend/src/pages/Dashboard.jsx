import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ListTodo,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import TaskList from "../components/TaskList.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/tasks/my-dashboard");
      setTasks(data.tasks);
      setCounts(data.counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateStatus = async (task, status) => {
    const data = await apiRequest(`/tasks/${task._id}`, {
      method: "PATCH",
      body: { status }
    });
    setTasks((current) =>
      current.map((item) => (item._id === task._id ? data.task : item))
    );
    loadDashboard();
  };

  const completionRate =
    tasks.length > 0 ? Math.round((counts.completed / tasks.length) * 100) : 0;

  return (
    <section className="page">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Workspace Command Center</p>
          <h1>Good to see you, {user.name.split(" ")[0]}</h1>
          <p>
            Keep the team moving with a quick view of ownership, deadlines, and
            work that needs attention.
          </p>
        </div>
        <div className="hero-metrics">
          <span>Completion rate</span>
          <strong>{completionRate}%</strong>
        </div>
      </div>

      <div className="page-header">
        <div>
          <p className="eyebrow">Daily desk</p>
          <h1>Assigned work</h1>
        </div>
        <button className="secondary-button" type="button" onClick={loadDashboard}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <ListTodo size={22} />
          <span>Pending</span>
          <strong>{counts.pending}</strong>
          <small>Open items on your desk</small>
        </article>
        <article className="stat-card">
          <CheckCircle2 size={22} />
          <span>Completed</span>
          <strong>{counts.completed}</strong>
          <small>Finished and filed</small>
        </article>
        <article className="stat-card danger-stat">
          <Clock3 size={22} />
          <span>Overdue</span>
          <strong>{counts.overdue}</strong>
          <small>Needs follow-up today</small>
        </article>
        <article className="stat-card accent-stat">
          <BriefcaseBusiness size={22} />
          <span>Total</span>
          <strong>{tasks.length}</strong>
          <small>Assignments tracked</small>
        </article>
        <article className="stat-card wide-stat">
          <TrendingUp size={22} />
          <span>Office pulse</span>
          <strong>{counts.overdue ? "Attention" : "Steady"}</strong>
          <small>
            {counts.overdue
              ? "Clear overdue work before opening new tasks."
              : "No overdue work in your current queue."}
          </small>
        </article>
      </div>

      <div className="section-heading">
        <h2>My tasks</h2>
      </div>

      {loading ? (
        <div className="screen-message compact">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks} onStatusChange={updateStatus} />
      )}
    </section>
  );
};

export default Dashboard;
