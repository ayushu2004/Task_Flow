import {
  Building2,
  Edit3,
  FolderPlus,
  Layers3,
  Trash2,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyProject = { name: "", description: "", teamMembers: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const memberUsers = useMemo(
    () => users.filter((user) => user.role === "Member" || user.role === "Admin"),
    [users]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectData, userData] = await Promise.all([
        apiRequest("/projects"),
        isAdmin ? apiRequest("/users") : Promise.resolve({ users: [] })
      ]);
      setProjects(projectData.projects);
      setUsers(userData.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const toggleMember = (id) => {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.includes(id)
        ? current.teamMembers.filter((memberId) => memberId !== id)
        : [...current.teamMembers, id]
    }));
  };

  const resetForm = () => {
    setForm(emptyProject);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const path = editingId ? `/projects/${editingId}` : "/projects";
      const method = editingId ? "PATCH" : "POST";
      await apiRequest(path, { method, body: form });
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || "",
      teamMembers: project.teamMembers.map((member) => member._id)
    });
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(`Delete "${project.name}" and all of its tasks?`);
    if (!confirmed) return;

    await apiRequest(`/projects/${project._id}`, { method: "DELETE" });
    setProjects((current) => current.filter((item) => item._id !== project._id));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Office portfolio</p>
          <h1>Project management</h1>
          <p className="lead">
            Organize team initiatives, assign the right people, and keep every project
            visible from one desk.
          </p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {isAdmin ? (
        <form className="form project-form" onSubmit={handleSubmit}>
          <div className="form-title">
            <Building2 size={20} />
            <div>
              <strong>{editingId ? "Update project brief" : "Create project brief"}</strong>
              <span>Set the scope and choose the people responsible.</span>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
          </div>

          <div className="member-picker">
            <span>
              <Users size={17} />
              Team members
            </span>
            <div>
              {memberUsers.map((user) => (
                <label className="check-pill" key={user._id}>
                  <input
                    type="checkbox"
                    checked={form.teamMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  {user.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              <FolderPlus size={17} />
              {editingId ? "Update project" : "Create project"}
            </button>
            {editingId ? (
              <button className="secondary-button" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="screen-message compact">Loading projects...</div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <div className="project-icon">
                <Layers3 size={22} />
              </div>
              <div>
                <h2>{project.name}</h2>
                <p>{project.description || "No description provided."}</p>
              </div>
              <div className="project-detail-line">
                <span>{project.teamMembers.length} teammates</span>
                <span>Created by {project.createdBy?.name || "Admin"}</span>
              </div>
              <div className="project-members">
                {project.teamMembers.map((member) => (
                  <span key={member._id}>{member.name}</span>
                ))}
              </div>
              <div className="card-actions">
                <Link className="secondary-button" to={`/projects/${project._id}`}>
                  Open
                </Link>
                {isAdmin ? (
                  <>
                    <button className="icon-button" type="button" onClick={() => startEdit(project)} title="Edit project">
                      <Edit3 size={17} />
                    </button>
                    <button className="icon-button danger" type="button" onClick={() => deleteProject(project)} title="Delete project">
                      <Trash2 size={17} />
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
