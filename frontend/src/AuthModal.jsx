import { SignIn } from "@clerk/react";
import "./AuthModal.css";

function AuthModal({ isOpen, backendWakeStatus, secondsRemaining, onRetry, onClose }) {
  if (!isOpen) {
    return null;
  }

  const isWarmingBackend = backendWakeStatus === "warming";
  const backendWakeTimedOut = backendWakeStatus === "timed_out";

  const renderBackendWakeScreen = () => (
    <div className="auth-modal__wake-screen" aria-live="polite">
      <div className="auth-modal__wake-spinner" aria-hidden="true" />
      <h2>{backendWakeTimedOut ? "PippoGPT is still starting" : "Starting PippoGPT"}</h2>
      <p>
        {backendWakeTimedOut
          ? "The server did not respond in time. Please try again."
          : "Our server is waking up so your chats are ready as soon as you sign in."}
      </p>
      {isWarmingBackend ? (
        <p className="auth-modal__wake-countdown">
          Up to <strong>{secondsRemaining}</strong> second{secondsRemaining === 1 ? "" : "s"} remaining
        </p>
      ) : (
        <button className="auth-modal__retry" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <button className="auth-modal__backdrop" type="button" onClick={onClose} aria-label="Close login" />
      <div className="auth-modal__panel">
        <div className="auth-modal__header">
          {isWarmingBackend || backendWakeTimedOut ? null : (
            <div>
              <h2>Login to PippoGPT</h2>
              <p>Sign in with Clerk to save chats and manage your history.</p>
            </div>
          )}
          <button className="auth-modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isWarmingBackend || backendWakeTimedOut ? (
          renderBackendWakeScreen()
        ) : (
          <div className="auth-modal__clerk">
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/"
              signUpFallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "auth-modal__clerk-root",
                  cardBox: "auth-modal__clerk-card-box",
                  card: "auth-modal__clerk-card",
                  headerTitle: "auth-modal__clerk-title",
                  headerSubtitle: "auth-modal__clerk-subtitle",
                  socialButtonsBlockButton: "auth-modal__clerk-social-button",
                  formFieldLabel: "auth-modal__clerk-label",
                  formFieldInput: "auth-modal__clerk-input",
                  formButtonPrimary: "auth-modal__clerk-primary-button",
                  footerAction: "auth-modal__clerk-footer-action",
                  footerActionLink: "auth-modal__clerk-footer-link",
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
