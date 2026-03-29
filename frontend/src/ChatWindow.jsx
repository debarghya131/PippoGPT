import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function MessageContent({ content }) {
  return (
    <div className="chat-window__message-body">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => <p className="chat-window__message-text">{children}</p>,
          pre: ({ children }) => <pre className="chat-window__code-block">{children}</pre>,
          code: ({ className, children, ...props }) => (
            <code className={className} {...props}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function AssistantLabel() {
  return <span className="chat-window__message-label">Pippo</span>;
}

function ChatWindow({
  activeThreadId,
  messages,
  setMessages,
  onThreadCreated,
  onRefreshThreads,
}) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const optimisticUserMessage = {
      role: "user",
      content: trimmedInput,
    };

    setError("");
    setIsLoading(true);
    setMessages((previousMessages) => [...previousMessages, optimisticUserMessage]);
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          threadId: activeThreadId || undefined,
          title: !activeThreadId ? trimmedInput : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);

      if (data.threadId && data.threadId !== activeThreadId) {
        onThreadCreated(data.threadId);
      } else {
        onRefreshThreads();
      }
    } catch (requestError) {
      setMessages((previousMessages) => previousMessages.slice(0, -1));
      setError(requestError.message || "Unable to connect to backend");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div
          className={`chat-window__messages${
            messages.length === 0 && !isLoading ? " chat-window__messages--empty" : ""
          }`}
        >
          {messages.length === 0 ? (
            <div className="chat-window__empty">
              <div className="chat-window__empty-copy">
                <div className="chat-window__empty-heading">
                  <h2>Start a chat with PippoGPT</h2>
                  <img
                    className="chat-window__empty-image"
                    src="/assets/pippo.png"
                    alt="Pippo"
                  />
                </div>
                <p>&quot;Ask me anything, and I&apos;ll do my best to help you.&quot;</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`chat-window__message chat-window__message--${message.role}`}
              >
                {message.role === "user" ? (
                  <>
                    <span className="chat-window__message-label">You</span>
                    <MessageContent content={message.content} />
                  </>
                ) : (
                  <>
                    <img
                      className="chat-window__message-logo"
                      src="/assets/pippo.png"
                      alt="Pippo logo"
                    />
                    <div className="chat-window__assistant-content">
                      <AssistantLabel />
                      <MessageContent content={message.content} />
                    </div>
                  </>
                )}
              </article>
            ))
          )}

          {isLoading ? (
            <article className="chat-window__message chat-window__message--assistant">
              <img
                className="chat-window__message-logo"
                src="/assets/pippo.png"
                alt="Pippo logo"
              />
              <div className="chat-window__assistant-content">
                <AssistantLabel />
                <div className="chat-window__loader" aria-label="Loading response" />
                {/* <MessageContent content="Thinking..." /> */}
              </div>
            </article>
          ) : null}
        </div>

        <div className="chat-window__dock">
          {error ? <p className="chat-window__error">{error}</p> : null}

          <form className="chat-window__input-shell" onSubmit={handleSubmit}>
            <button
              className="chat-window__icon-button chat-window__icon-button--plus"
              type="button"
              aria-label="Add attachment"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            <img
              className="chat-window__composer-logo"
              src="/assets/pippo.png"
              alt="Pippo"
            />

            <input
              className="chat-window__input"
              type="text"
              placeholder="Ask anything"
              aria-label="Ask anything"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
            />

            <div className="chat-window__actions">
              <button
                className="chat-window__icon-button chat-window__icon-button--mic"
                type="button"
                aria-label="Voice input"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 15a3 3 0 0 0 3-3V8a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0M12 17v3M9 20h6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>

              <button
                className={`chat-window__send${input.trim() ? " chat-window__send--active" : ""}`}
                type="submit"
                aria-label="Send message"
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d={input.trim() ? "M12 5v14M5 12l7-7 7 7" : "M7 12l3 3 7-8"}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </div>
          </form>

          <p className="chat-window__note">
            PippoGPT can make mistakes. Check important info. See Cookie Preferences.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChatWindow;
