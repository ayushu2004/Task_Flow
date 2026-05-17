import { CalendarClock, FolderKanban, Trash2, UserRound } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));

const isOverdue = (task) => task.status !== "Done" && new Date(task.dueDate) < new Date();

const TaskList = ({ tasks, onStatusChange, onDelete, canDelete = false }) => {
  if (!tasks.length) {
    return <div className="empty-state">No tasks match this view.</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className={`task-row ${isOverdue(task) ? "overdue" : ""}`} key={task._id}>
          <div className="task-main">
            <div className="task-title-line">
              <h3>{task.title}</h3>
              <StatusBadge status={task.status} />
            </div>
            {task.description ? <p>{task.description}</p> : null}
            <div className="task-meta">
              <span>
                <FolderKanban size={15} />
                {task.project?.name}
              </span>
              <span>
                <UserRound size={15} />
                {task.assignedTo?.name}
              </span>
              <span className="date-chip">
                <CalendarClock size={15} />
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>

          <div className="task-actions">
            <select
              aria-label="Task status"
              value={task.status}
              onChange={(event) => onStatusChange(task, event.target.value)}
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            {canDelete ? (
              <button className="icon-button danger" type="button" onClick={() => onDelete(task)} title="Delete task">
                <Trash2 size={17} />
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
};

export default TaskList;
