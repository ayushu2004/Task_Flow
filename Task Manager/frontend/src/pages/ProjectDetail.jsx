import { ClipboardList, Filter, Plus, RefreshCw, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import TaskList from "../components/TaskList.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyTask = {
  title: "",
  description: "",
  assignedTo: "",
  status: "Todo",
  dueDate: ""
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [filters, setFilters] = useState({ status: "", assignedTo: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const members = useMemo(() => project?.teamMembers || [], [project]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.assignedTo && isAdmin) params.set("assignedTo", filters.assignedTo);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const loadProject = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectData, taskData] = await Promise.all([
        apiRequest(`/projects/${id}`),
        apiRequest(`/projects/${id}/tasks${buildQuery()}`)
      ]);
      setProject(projectData.project);
      setTasks(taskData.tasks);
      setForm((current) => ({
        ...current,
        assignedTo: current.assignedTo || projectData.project.teamMembers[0]?._id || ""
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id, filters.status, filters.assignedTo]);

  const createTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await apiRequest(`/projects/${id}/tasks`, {
        method: "POST",
        body: form
      });
      setForm({ ...emptyTask, assignedTo: members[0]?._id || "" });
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (task, status) => {
    const data = await apiRequest(`/tasks/${task._id}`, {
      method: "PATCH",
      body: { status }
    });
    setTasks((current) =>
      current.map((item) => (item._id === task._id ? data.task : item))
    );
  };

  const deleteTask = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    await apiRequest(`/tasks/${task._id}`, { method: "DELETE" });
    setTasks((current) => current.filter((item) => item._id !== task._id));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            <Link to="/projects">Projects</Link>
          </p>
          <h1>{project?.name || "Project"}</h1>
          <p className="lead">
            {members.length} teammates assigned to this project workspace.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={loadProject}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {project?.description ? <p className="lead">{project.description}</p> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {isAdmin ? (
        <form className="form task-form" onSubmit={createTask}>
          <div className="form-title">
            <ClipboardList size={20} />
            <div>
              <strong>Create task memo</strong>
              <span>Assign ownership, set a due date, and track delivery.</span>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </label>
            <label>
              Assigned user
              <select
                value={form.assignedTo}
                onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                required
              >
                {members.map((member) => (
                  <option value={member._id} key={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                required
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!members.length}>
            <Plus size={17} />
            Create task
          </button>
        </form>
      ) : null}

      <div className="filters">
        <span className="filter-label">
          <Filter size={17} />
          Filter task board
        </span>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">All</option>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </label>
        {isAdmin ? (
          <label>
            User
            <select
              value={filters.assignedTo}
              onChange={(event) => setFilters({ ...filters, assignedTo: event.target.value })}
            >
              <option value="">All</option>
              {members.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className="member-count">
          <Users size={16} />
          {members.length} people
        </span>
      </div>

      {loading ? (
        <div className="screen-message compact">Loading project...</div>
      ) : (
        <TaskList
          tasks={tasks}
          onStatusChange={updateStatus}
          onDelete={deleteTask}
          canDelete={isAdmin}
        />
      )}
    </section>
  );
};

export default ProjectDetail;
