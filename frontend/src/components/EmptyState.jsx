import "./EmptyState.css";

export default function EmptyState({
    icon = "📋",
    title = "No data yet",
    description = "There's nothing to show here.",
}) {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">{icon}</span>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-desc">{description}</p>
        </div>
    );
}
