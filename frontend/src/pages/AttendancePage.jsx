import { useState, useEffect } from "react";
import {
    getAttendance,
    markAttendance,
    getEmployees,
} from "../services/api";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import "./AttendancePage.css";

export default function AttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Mark attendance form
    const [formEmployee, setFormEmployee] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [formStatus, setFormStatus] = useState("Present");
    const [showForm, setShowForm] = useState(false);

    const fetchAttendance = async () => {
        setLoading(true);
        setError("");
        try {
            const params = {};
            if (filterEmployee) params.employee_id = filterEmployee;
            if (filterDate) params.date = filterDate;
            const res = await getAttendance(params);
            setAttendance(res.data);
        } catch {
            setError("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data);
        } catch {
            // Silently fail — the employee dropdown will be empty
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [filterEmployee, filterDate]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!formEmployee) {
            setError("Please select an employee.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await markAttendance({
                employee: formEmployee,
                date: formDate,
                status: formStatus,
            });
            setShowForm(false);
            setFormEmployee("");
            setFormStatus("Present");
            await fetchAttendance();
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const messages = Object.entries(data.errors)
                    .map(([field, msgs]) => {
                        if (typeof msgs === "object" && !Array.isArray(msgs)) {
                            return Object.values(msgs).flat().join(", ");
                        }
                        return `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`;
                    })
                    .join(" | ");
                setError(messages);
            } else {
                setError("Failed to mark attendance. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attendance</h1>
                    <p className="page-subtitle">Track and manage daily attendance records</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "✕ Cancel" : "✓ Mark Attendance"}
                </button>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError("")} />

            {/* ── Mark Attendance Form ──────────────── */}
            {showForm && (
                <div className="card form-card">
                    <div className="card-header">
                        <h2 className="card-title">Mark Attendance</h2>
                    </div>
                    <form onSubmit={handleMarkAttendance} className="attendance-form">
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label htmlFor="att-employee">Employee</label>
                                <select
                                    id="att-employee"
                                    value={formEmployee}
                                    onChange={(e) => setFormEmployee(e.target.value)}
                                    required
                                >
                                    <option value="">Select employee...</option>
                                    {employees.map((emp) => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.employee_id} — {emp.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="att-date">Date</label>
                                <input
                                    type="date"
                                    id="att-date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="att-status">Status</label>
                                <select
                                    id="att-status"
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                >
                                    <option value="Present">✅ Present</option>
                                    <option value="Absent">❌ Absent</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Attendance"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Filters ──────────────────────────── */}
            <div className="card filter-card">
                <div className="filter-bar">
                    <div className="form-group">
                        <label htmlFor="filter-employee">Filter by Employee</label>
                        <select
                            id="filter-employee"
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                        >
                            <option value="">All employees</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.employee_id} — {emp.full_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="filter-date">Filter by Date</label>
                        <input
                            type="date"
                            id="filter-date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    {(filterEmployee || filterDate) && (
                        <button
                            className="btn btn-ghost btn-sm clear-btn"
                            onClick={() => { setFilterEmployee(""); setFilterDate(""); }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* ── Attendance Table ─────────────────── */}
            <div className="card">
                {loading ? (
                    <Spinner message="Loading records..." />
                ) : attendance.length === 0 ? (
                    <EmptyState
                        icon="📅"
                        title="No attendance records"
                        description={
                            filterEmployee || filterDate
                                ? "No records match the current filters."
                                : "Mark attendance to see records appear here."
                        }
                    />
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Employee Name</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((rec) => (
                                    <tr key={rec.id}>
                                        <td>
                                            <span className="badge badge-id">{rec.employee}</span>
                                        </td>
                                        <td className="text-bold">{rec.employee_name}</td>
                                        <td>{rec.date}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${rec.status === "Present" ? "status-present" : "status-absent"
                                                    }`}
                                            >
                                                {rec.status === "Present" ? "✅" : "❌"} {rec.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
