import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <span className="navbar-logo">⚡</span>
                    <span className="navbar-title">HRMS Lite</span>
                </div>
                <ul className="navbar-links">
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/employees" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Employees
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Attendance
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
