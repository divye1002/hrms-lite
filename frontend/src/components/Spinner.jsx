import "./Spinner.css";

export default function Spinner({ message = "Loading..." }) {
    return (
        <div className="spinner-container">
            <div className="spinner-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <p className="spinner-text">{message}</p>
        </div>
    );
}
