import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import AttendancePage from "./pages/AttendancePage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/attendance" element={<AttendancePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
