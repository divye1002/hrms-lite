import { useState, useEffect } from "react";
import "./ErrorAlert.css";

export default function ErrorAlert({ message, onDismiss }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
    }, [message]);

    if (!message || !visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    return (
        <div className="error-alert" role="alert">
            <span className="error-alert-icon">⚠</span>
            <span className="error-alert-message">{message}</span>
            <button className="error-alert-close" onClick={handleDismiss} aria-label="Dismiss">
                ✕
            </button>
        </div>
    );
}
