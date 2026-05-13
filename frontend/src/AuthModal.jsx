import { useState } from "react";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onSubmit, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  if (!isOpen) {
    return null;
  }

  const isRegister = mode === "register";

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(mode, form);
  };

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <button className="auth-modal__backdrop" type="button" onClick={onClose} aria-label="Close login" />
      <form className="auth-modal__panel" onSubmit={handleSubmit}>
        <div className="auth-modal__header">
          <div>
            <h2>{isRegister ? "Create account" : "Login to PippoGPT"}</h2>
            <p>{isRegister ? "Save chats and use PippoGPT." : "Login first to chat and manage history."}</p>
          </div>
          <button className="auth-modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isRegister ? (
          <label className="auth-modal__field">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} autoComplete="name" />
          </label>
        ) : null}

        <label className="auth-modal__field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </label>

        <label className="auth-modal__field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>

        {error ? <p className="auth-modal__error">{error}</p> : null}

        <button className="auth-modal__submit" type="submit">
          {isRegister ? "Create account" : "Login"}
        </button>

        <button
          className="auth-modal__switch"
          type="button"
          onClick={() => setMode(isRegister ? "login" : "register")}
        >
          {isRegister ? "Already have an account? Login" : "New here? Create account"}
        </button>
      </form>
    </div>
  );
}

export default AuthModal;
