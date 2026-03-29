import { useState } from "react";
import "./Slidbar.css";

function Slidbar({
  threads,
  activeThreadId,
  isLoading,
  deletingThreadId,
  onNewChat,
  onSelectThread,
  onDeleteThread,
}) {
  const [showAllThreads, setShowAllThreads] = useState(false);
  const visibleThreadCount = 13;

  const visibleThreads = showAllThreads ? threads : threads.slice(0, visibleThreadCount);
  const hasHiddenThreads = threads.length > visibleThreadCount;

  return (
    <aside className="slidbar">
      <div className="slidbar__top">
        <button
          className="slidbar__compose"
          type="button"
          aria-label="Start new chat"
          onClick={onNewChat}
        >
          <div className="slidbar__brand">
            <span className="slidbar__logo-wrap">
              <img className="slidbar__logo" src="/assets/pippo.png" alt="Pippo logo" />
            </span>
            <span className="slidbar__brand-text">
              <span className="slidbar__brand-name">New chat</span>
              <span className="slidbar__brand-subtitle">with Pippo</span>
            </span>
          </div>
          <span className="slidbar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M14.06 4.94h5v5M10 14 19.06 4.94M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
        </button>

        <div className="slidbar__threads">
          {isLoading ? (
            <p className="slidbar__status">Loading threads...</p>
          ) : threads.length === 0 ? (
            <p className="slidbar__status">No chats yet. Start a new one.</p>
          ) : (
            <>
              {visibleThreads.map((thread) => (
                <div
                  key={thread.threadId}
                  className={`slidbar__thread-row${
                    activeThreadId === thread.threadId ? " slidbar__thread-row--active" : ""
                  }`}
                >
                  <button
                    className={`slidbar__thread${
                      activeThreadId === thread.threadId ? " slidbar__thread--active" : ""
                    }`}
                    type="button"
                    onClick={() => onSelectThread(thread.threadId)}
                  >
                    {thread.title || "Untitled chat"}
                  </button>
                  <button
                    className="slidbar__delete"
                    type="button"
                    aria-label={`Delete ${thread.title || "thread"}`}
                    onClick={() => onDeleteThread(thread.threadId)}
                    disabled={deletingThreadId === thread.threadId}
                  >
                    {deletingThreadId === thread.threadId ? (
                      "..."
                    ) : (
                      <i className="fa-regular fa-trash-can" aria-hidden="true" />
                    )}
                  </button>
                </div>
              ))}

              {hasHiddenThreads ? (
                <button
                  className="slidbar__more"
                  type="button"
                  onClick={() => setShowAllThreads((currentValue) => !currentValue)}
                >
                  {showAllThreads ? "Show less" : `More (${threads.length - visibleThreadCount})`}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <footer className="slidbar__footer">
        <span>By Debarghya</span>
        <span className="slidbar__heart" aria-label="love">
          ❤
        </span>
      </footer>
    </aside>
  );
}

export default Slidbar;
