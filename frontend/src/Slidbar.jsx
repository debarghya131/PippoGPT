import "./Slidbar.css";

const threads = ["thread1", "thread2", "thread3"];

function Slidbar() {
  return (
    <aside className="slidbar">
      <div className="slidbar__top">
        <button className="slidbar__compose" type="button" aria-label="Start new chat">
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
          {threads.map((thread) => (
            <button key={thread} className="slidbar__thread" type="button">
              {thread}
            </button>
          ))}
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
