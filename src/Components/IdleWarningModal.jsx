// src/Components/IdleWarningModal.jsx

export default function IdleWarningModal({ open, onContinue }) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Session Expiring</h3>
        <p>Your session will expire in 5 minutes due to inactivity.</p>

        <button
          onClick={onContinue}
          style={continueButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#115293")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#1976d2")
          }
        >
          Continue Session
        </button>

      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "6px",
  minWidth: "300px",
  textAlign: "center",
};

const continueButtonStyle = {
  marginTop: "16px",
  padding: "10px 20px",
  background: "#1976d2",      // professional blue
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "background 0.2s ease, transform 0.1s ease",
};