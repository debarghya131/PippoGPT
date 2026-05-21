import { SignIn } from "@clerk/react";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <button className="auth-modal__backdrop" type="button" onClick={onClose} aria-label="Close login" />
      <div className="auth-modal__panel">
        <div className="auth-modal__header">
          <div>
            <h2>Login to PippoGPT</h2>
            <p>Sign in with Clerk to save chats and manage your history.</p>
          </div>
          <button className="auth-modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="auth-modal__clerk">
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "auth-modal__clerk-root",
                card: "auth-modal__clerk-card",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
