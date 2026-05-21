import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const EMPTY_PROMPTS = ["Write code", "Explain a topic", "Summarize text"];
const DEMO_MODELS = [
  "PippoGPT Nova",
  "PippoGPT Neon",
  "PippoGPT Orbit",
  "PippoGPT X",
  "PippoGPT Quantum ✨",
];

function MessageContent({ content }) {
  const [copiedCode, setCopiedCode] = useState("");
  const shouldHighlightLifetime = content.includes("rate_limit_error");

  const getNodeText = (node) => {
    if (typeof node === "string") {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map(getNodeText).join("");
    }

    if (node?.props?.children) {
      return getNodeText(node.props.children);
    }

    return "";
  };

  const highlightLifetime = (node) => {
    if (typeof node === "string") {
      return node.split(/(lifetime)/gi).map((part, index) =>
        part.toLowerCase() === "lifetime" ? (
          <span className="chat-window__message-danger-word" key={`${part}-${index}`}>
            {part}
          </span>
        ) : (
          part
        ),
      );
    }

    if (Array.isArray(node)) {
      return node.map((child) => highlightLifetime(child));
    }

    if (isValidElement(node)) {
      return cloneElement(node, {
        children: highlightLifetime(node.props.children),
      });
    }

    return node;
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1200);
    } catch (error) {
      console.error("Copy failed:", error.message);
    }
  };

  return (
    <div className="chat-window__message-body">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => (
            <p className="chat-window__message-text">
              {shouldHighlightLifetime ? highlightLifetime(Children.toArray(children)) : children}
            </p>
          ),
          pre: ({ children }) => {
            const code = getNodeText(children).replace(/\n$/, "");
            const isCopied = copiedCode === code && code.length > 0;

            return (
              <div className="chat-window__code-shell">
                <button
                  className={`chat-window__copy-code${isCopied ? " chat-window__copy-code--done" : ""}`}
                  type="button"
                  aria-label={isCopied ? "Copied" : "Copy code"}
                  onClick={() => copyCode(String(code))}
                >
                  {isCopied ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="m5 13 4 4L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M9 8.5a2.5 2.5 0 0 1 2.5-2.5H18a2.5 2.5 0 0 1 2.5 2.5V15A2.5 2.5 0 0 1 18 17.5h-6.5A2.5 2.5 0 0 1 9 15V8.5Z"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M15 6v-.5A2.5 2.5 0 0 0 12.5 3H6a2.5 2.5 0 0 0-2.5 2.5V12A2.5 2.5 0 0 0 6 14.5h.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
                <pre className="chat-window__code-block">{children}</pre>
              </div>
            );
          },
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
  userName,
  isAuthenticated,
  activeThreadId,
  threadSelectionKey,
  messages,
  setMessages,
  buildAuthHeaders,
  onRequireLogin,
  onOpenSidebar,
  onLoginClick,
  onLogout,
  onShowNotice,
  onThreadCreated,
  onRefreshThreads,
}) {
  const messagesContainerRef = useRef(null);
  const pendingScrollKeyRef = useRef(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const isEmptyChat = messages.length === 0 && !isLoading;

  useEffect(() => {
    if (isAuthenticated) {
      setError("");
    }
  }, [isAuthenticated]);

  const scrollMessagesToTop = () => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTop = 0;
  };

  useEffect(() => {
    pendingScrollKeyRef.current = threadSelectionKey;
    scrollMessagesToTop();
    requestAnimationFrame(scrollMessagesToTop);
  }, [activeThreadId, threadSelectionKey]);

  useEffect(() => {
    if (pendingScrollKeyRef.current !== threadSelectionKey) {
      return;
    }

    requestAnimationFrame(scrollMessagesToTop);
    const timeoutId = window.setTimeout(() => {
      scrollMessagesToTop();
      pendingScrollKeyRef.current = 0;
    }, 90);

    return () => window.clearTimeout(timeoutId);
  }, [messages, threadSelectionKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError("You need to login first.");
      onRequireLogin();
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
          ...(await buildAuthHeaders()),
        },
        body: JSON.stringify({
          message: trimmedInput,
          threadId: activeThreadId || undefined,
          title: !activeThreadId ? trimmedInput : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const rateLimitMessage =
            "Daily limit reached. Please check demo threads or come back tomorrow.";
          onShowNotice?.(rateLimitMessage);
          throw new Error(rateLimitMessage);
        }

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

  const handleCheckDemoThreads = async () => {
    setMessages([]);
    if (isAuthenticated) {
      await onLogout();
    }
    onOpenSidebar();
  };

  return (
    <main className="chat-window">
      <div className="chat-window__topbar">
        <div className="chat-window__topbar-left">
          <button
            className="chat-window__menu-button"
            type="button"
            aria-label="Open sidebar"
            onClick={onOpenSidebar}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.9"
              />
            </svg>
          </button>

          <div className="chat-window__model-menu">
            <button
              className="chat-window__model"
              type="button"
              aria-expanded={isModelMenuOpen}
              onClick={() => setIsModelMenuOpen((currentValue) => !currentValue)}
            >
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

            {isModelMenuOpen ? (
              <div className="chat-window__model-options">
                {DEMO_MODELS.map((model) => (
                  <button
                    className="chat-window__model-option"
                    key={model}
                    type="button"
                    onClick={() => setIsModelMenuOpen(false)}
                  >
                    {model}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {isAuthenticated ? (
          <button className="chat-window__auth-button" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button className="chat-window__auth-button" type="button" onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>

      <section
        className={`chat-window__content${
          isEmptyChat ? " chat-window__content--empty" : ""
        }`}
      >
        <div
          ref={messagesContainerRef}
          className={`chat-window__messages${
            isEmptyChat ? " chat-window__messages--empty" : ""
          }`}
        >
          {messages.length === 0 ? (
            <div className="chat-window__empty">
              <div className="chat-window__empty-copy">
                <div className="chat-window__empty-heading">
                  <h2>How can I help, {userName}?</h2>
                </div>
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
          {error ? (
            <div className="chat-window__error-row">
              <p className="chat-window__error">{error}</p>
              {error.includes("demo threads") ? (
                <button
                  className="chat-window__error-action"
                  type="button"
                  onClick={handleCheckDemoThreads}
                >
                  Check demo threads
                </button>
              ) : null}
            </div>
          ) : null}

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

          {isEmptyChat ? (
            <div className="chat-window__prompt-chips" aria-label="Prompt suggestions">
              {EMPTY_PROMPTS.map((prompt) => (
                <button
                  className="chat-window__prompt-chip"
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <p className="chat-window__note">
            PippoGPT can make mistakes. Check important info. See Cookie Preferences.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChatWindow;
