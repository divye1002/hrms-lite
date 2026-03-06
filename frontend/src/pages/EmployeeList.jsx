import { useState, useEffect } from "react";
import { getEmployees, createEmployee, deleteEmployee } from "../services/api";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import "./EmployeeList.css";

const INITIAL_FORM = { employee_id: "", full_name: "", email: "", department: "" };

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getEmployees();
            setEmployees(res.data);
        } catch {
            setError("Failed to load employees. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await createEmployee(formData);
            setFormData(INITIAL_FORM);
            setShowForm(false);
            await fetchEmployees();
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const messages = Object.entries(data.errors)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
                    .join(" | ");
                setError(messages);
            } else {
                setError("Failed to create employee. Please check the form and try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (employeeId) => {
        setError("");
        try {
            await deleteEmployee(employeeId);
            setDeleteConfirm(null);
            await fetchEmployees();
        } catch {
            setError(`Failed to delete employee ${employeeId}.`);
        }
    };

    if (loading) return <Spinner message="Loading employees..." />;

    return (
        <div className="employee-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">
                        Manage your team — {employees.length} employee{employees.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "✕ Cancel" : "+ Add Employee"}
                </button>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError("")} />

            {/* ── Add Employee Form ─────────────────── */}
            {showForm && (
                <div className="card form-card">
                    <div className="card-header">
                        <h2 className="card-title">New Employee</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="employee-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="employee_id">Employee ID</label>
                                <input
                                    type="text"
                                    id="employee_id"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    placeholder="e.g. EMP001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Full Name</label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. john@company.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Engineering"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "Adding..." : "Add Employee"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => { setShowForm(false); setFormData(INITIAL_FORM); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Employee Table ────────────────────── */}
            <div className="card">
                {employees.length === 0 ? (
                    <EmptyState
                        icon="👤"
                        title="No employees yet"
                        description="Click 'Add Employee' to get started."
                    />
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.employee_id}>
                                        <td>
                                            <span className="badge badge-id">{emp.employee_id}</span>
                                        </td>
                                        <td className="text-bold">{emp.full_name}</td>
                                        <td className="text-email">{emp.email}</td>
                                        <td>{emp.department}</td>
                                        <td>
                                            {deleteConfirm === emp.employee_id ? (
                                                <div className="confirm-actions">
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(emp.employee_id)}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-danger-outline btn-sm"
                                                    onClick={() => setDeleteConfirm(emp.employee_id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
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
