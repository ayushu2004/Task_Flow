const statusClass = {
  Todo: "badge todo",
  "In Progress": "badge progress",
  Done: "badge done"
};

const StatusBadge = ({ status }) => {
  return <span className={statusClass[status] || "badge"}>{status}</span>;
};

export default StatusBadge;
