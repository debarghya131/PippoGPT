import "./Chat.css";

function ChatWindow() {
  return (
    <main className="chat-window">
      <div className="chat-window__topbar">
        <button className="chat-window__model" type="button">
          <span>PippoGPT</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m7 10 5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>

        <button className="chat-window__profile" type="button" aria-label="Profile">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.314 0-6 1.79-6 4v1h12v-1c0-2.21-2.686-4-6-4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <section className="chat-window__content">
        <div className="chat-window__spacer" />

        <div className="chat-window__dock">
          <div className="chat-window__input-shell">
            <input
              className="chat-window__input"
              type="text"
              placeholder="Ask anything"
              aria-label="Ask anything"
            />
            <button className="chat-window__send" type="button" aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m4 12 15-7-4 14-3.5-5L4 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </div>

          <p className="chat-window__note">
            PippoGPT can make mistakes. Check important info. See Cookie Preferences.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChatWindow;
