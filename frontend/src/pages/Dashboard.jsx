import { useState, useEffect } from "react";
import { getDashboard } from "../services/api";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import "./Dashboard.css";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getDashboard();
            setData(res.data);
        } catch (err) {
            setError("Failed to load dashboard data. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) return <Spinner message="Loading dashboard..." />;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your workforce at a glance</p>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError("")} />

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card card-total">
                            <div className="card-icon">👥</div>
                            <div className="card-info">
                                <span className="card-value">{data.total_employees}</span>
                                <span className="card-label">Total Employees</span>
                            </div>
                        </div>
                        <div className="summary-card card-present">
                            <div className="card-icon">✅</div>
                            <div className="card-info">
                                <span className="card-value">{data.today_present}</span>
                                <span className="card-label">Present Today</span>
                            </div>
                        </div>
                        <div className="summary-card card-absent">
                            <div className="card-icon">❌</div>
                            <div className="card-info">
                                <span className="card-value">{data.today_absent}</span>
                                <span className="card-label">Absent Today</span>
                            </div>
                        </div>
                        <div className="summary-card card-unmarked">
                            <div className="card-icon">⏳</div>
                            <div className="card-info">
                                <span className="card-value">{data.today_unmarked}</span>
                                <span className="card-label">Unmarked Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Employee Stats Table */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Employee Attendance Summary</h2>
                        </div>
                        {data.employee_stats.length === 0 ? (
                            <EmptyState
                                icon="👤"
                                title="No employees yet"
                                description="Add employees to see their attendance summary here."
                            />
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Full Name</th>
                                            <th>Department</th>
                                            <th>Days Present</th>
                                            <th>Total Records</th>
                                            <th>Attendance Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.employee_stats.map((emp) => {
                                            const rate =
                                                emp.total_records > 0
                                                    ? Math.round((emp.total_present / emp.total_records) * 100)
                                                    : 0;
                                            return (
                                                <tr key={emp.employee_id}>
                                                    <td>
                                                        <span className="badge badge-id">{emp.employee_id}</span>
                                                    </td>
                                                    <td className="text-bold">{emp.full_name}</td>
                                                    <td>{emp.department}</td>
                                                    <td>
                                                        <span className="text-success">{emp.total_present}</span>
                                                    </td>
                                                    <td>{emp.total_records}</td>
                                                    <td>
                                                        <div className="progress-bar-wrapper">
                                                            <div className="progress-bar">
                                                                <div
                                                                    className="progress-fill"
                                                                    style={{ width: `${rate}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="progress-label">{rate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
