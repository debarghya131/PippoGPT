import "./Sidebar.css";

function Sidebar({
  isOpen,
  isDemoMode,
  threads,
  activeThreadId,
  isLoading,
  deletingThreadId,
  demoViews,
  onNewChat,
  onSelectThread,
  onDeleteThread,
}) {
  const featuredThreadTitles = new Set([
    "Debarghya Bandyopadhyay Chat",
    "Semester Wise Engineering Guidance",
    "3-Month Interview Preparation Roadmap Chat",
    "Hackathon Importance Chat",
  ]);
  const isFeaturedThread = (thread) => isDemoMode && featuredThreadTitles.has(thread.title);

  return (
    <aside
      className={`sidebar${isOpen ? " sidebar--open" : ""}${
        isDemoMode ? " sidebar--demo" : ""
      }`}
    >
      <div className="sidebar__top">
        <button
          className="sidebar__compose"
          type="button"
          aria-label="Start new chat"
          onClick={onNewChat}
        >
          <div className="sidebar__brand">
            <span className="sidebar__logo-wrap">
              <img className="sidebar__logo" src="/assets/pippo.png" alt="Pippo logo" />
            </span>
            <span className="sidebar__brand-text">
              <span className="sidebar__brand-name">New chat</span>
              <span className="sidebar__brand-subtitle">with Pippo</span>
            </span>
          </div>
          <span className="sidebar__icon" aria-hidden="true">
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

        <div className="sidebar__threads">
          <h2 className="sidebar__section-heading">Recents</h2>
          {isLoading ? (
            <p className="sidebar__status">Loading threads...</p>
          ) : threads.length === 0 ? (
            <p className="sidebar__status">
              {isDemoMode ? "Browse demo chats. Login to unlock real chat actions." : "No chats yet. Start a new one."}
            </p>
          ) : (
            <>
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  className={`sidebar__thread-row${
                    activeThreadId === thread.threadId ? " sidebar__thread-row--active" : ""
                  }${isFeaturedThread(thread) ? " sidebar__thread-row--featured" : ""
                  }`}
                >
                  <button
                    className={`sidebar__thread${
                      activeThreadId === thread.threadId ? " sidebar__thread--active" : ""
                    }${isFeaturedThread(thread) ? " sidebar__thread--featured" : ""
                    }${!isDemoMode ? " sidebar__thread--truncate" : ""
                    }`}
                    type="button"
                    onClick={() => onSelectThread(thread.threadId)}
                  >
                    <span className="sidebar__thread-title">
                      {thread.title || "Untitled chat"}
                    </span>
                    {isDemoMode ? (
                      <span
                        className="sidebar__thread-views"
                        aria-label={
                          demoViews === null
                            ? "Loading views"
                            : `${demoViews[thread.threadId] || 0} views`
                        }
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                        </svg>
                        {demoViews === null ? (
                          <span className="sidebar__thread-views-loader" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          Number(demoViews[thread.threadId] || 0).toLocaleString()
                        )}
                      </span>
                    ) : null}
                  </button>
                  <button
                    className="sidebar__delete"
                    type="button"
                    aria-label={`Delete ${thread.title || "thread"}`}
                    onClick={() => onDeleteThread(thread.threadId)}
                    disabled={deletingThreadId === thread.threadId}
                  >
                    {deletingThreadId === thread.threadId ? (
                      "..."
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <footer className="sidebar__footer">
        <span>By Debarghya</span>
        <span className="sidebar__heart" aria-label="love">
          ❤
        </span>
      </footer>
    </aside>
  );
}

export default Sidebar;
