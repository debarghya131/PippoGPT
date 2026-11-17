import { useAuth, useUser } from "@clerk/react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { DEMO_THREADS } from "./demoChats.js";

const AuthModal = lazy(() => import("./AuthModal.jsx"));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const VIEW_SESSION_KEY = "pippo_gpt_view_counted";
const VIEW_SESSION_ID_KEY = "pippo_gpt_view_session_id";
const DEMO_VIEW_SESSION_PREFIX = "pippo_gpt_demo_view_counted:";
const BACKEND_WAKE_TIMEOUT_MS = 60_000;
const BACKEND_WAKE_RETRY_DELAY_MS = 2_000;

const getViewSessionId = () => {
  try {
    const existingSessionId = window.sessionStorage.getItem(VIEW_SESSION_ID_KEY);

    if (existingSessionId && existingSessionId !== "true") {
      return existingSessionId;
    }

    const sessionId = window.crypto.randomUUID();
    window.sessionStorage.setItem(VIEW_SESSION_ID_KEY, sessionId);
    return sessionId;
  } catch {
    return window.crypto.randomUUID();
  }
};

function App() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [backendUser, setBackendUser] = useState(null);
  const [backendAuthStatus, setBackendAuthStatus] = useState("idle");
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [threadSelectionKey, setThreadSelectionKey] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [backendWakeStatus, setBackendWakeStatus] = useState("idle");
  const [backendWakeSecondsRemaining, setBackendWakeSecondsRemaining] = useState(60);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [websiteViews, setWebsiteViews] = useState(null);
  const [demoViews, setDemoViews] = useState(null);
  const threadLoadRequestRef = useRef(0);
  const countedDemoViewsRef = useRef(new Set());
  const authSyncRequestRef = useRef(0);
  const backendWakeRequestRef = useRef(0);
  const backendWakeAbortRef = useRef(null);
  const backendWakeTimeoutRef = useRef(null);
  const backendWakeRetryRef = useRef(null);
  const backendWakeDeadlineRef = useRef(0);

  const isAuthenticated = Boolean(isSignedIn);
  const isBackendReady = isAuthenticated && backendAuthStatus === "ready";

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.clearTimeout(showNotice.timeoutId);
    showNotice.timeoutId = window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const buildAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  const cancelBackendWake = useCallback(() => {
    backendWakeRequestRef.current += 1;
    backendWakeAbortRef.current?.abort();
    window.clearTimeout(backendWakeTimeoutRef.current);
    window.clearTimeout(backendWakeRetryRef.current);
    backendWakeAbortRef.current = null;
    backendWakeTimeoutRef.current = null;
    backendWakeRetryRef.current = null;
  }, []);

  const startBackendWake = useCallback(() => {
    cancelBackendWake();

    const requestId = backendWakeRequestRef.current + 1;
    const controller = new AbortController();
    backendWakeRequestRef.current = requestId;
    backendWakeAbortRef.current = controller;
    backendWakeDeadlineRef.current = Date.now() + BACKEND_WAKE_TIMEOUT_MS;
    setBackendWakeSecondsRemaining(60);
    setBackendWakeStatus("warming");
    setIsAuthModalOpen(true);

    const isCurrentRequest = () => backendWakeRequestRef.current === requestId;
    const clearWakeTimers = () => {
      window.clearTimeout(backendWakeTimeoutRef.current);
      window.clearTimeout(backendWakeRetryRef.current);
      backendWakeTimeoutRef.current = null;
      backendWakeRetryRef.current = null;
    };

    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!isCurrentRequest()) {
          return;
        }

        if (response.ok) {
          clearWakeTimers();
          backendWakeAbortRef.current = null;
          setBackendWakeStatus("idle");
          return;
        }
      } catch (error) {
        if (error.name === "AbortError" || !isCurrentRequest()) {
          return;
        }
      }

      if (isCurrentRequest()) {
        backendWakeRetryRef.current = window.setTimeout(checkHealth, BACKEND_WAKE_RETRY_DELAY_MS);
      }
    };

    backendWakeTimeoutRef.current = window.setTimeout(() => {
      if (!isCurrentRequest()) {
        return;
      }

      backendWakeRequestRef.current += 1;
      controller.abort();
      backendWakeAbortRef.current = null;
      window.clearTimeout(backendWakeRetryRef.current);
      backendWakeRetryRef.current = null;
      setBackendWakeSecondsRemaining(0);
      setBackendWakeStatus("timed_out");
    }, BACKEND_WAKE_TIMEOUT_MS);

    checkHealth();
  }, [cancelBackendWake]);

  const closeAuthModal = useCallback(() => {
    cancelBackendWake();
    setBackendWakeStatus("idle");
    setIsAuthModalOpen(false);
  }, [cancelBackendWake]);

  useEffect(() => {
    if (backendWakeStatus !== "warming") {
      return undefined;
    }

    const updateCountdown = () => {
      const millisecondsRemaining = Math.max(0, backendWakeDeadlineRef.current - Date.now());
      setBackendWakeSecondsRemaining(Math.ceil(millisecondsRemaining / 1000));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(intervalId);
  }, [backendWakeStatus]);

  useEffect(
    () => () => {
      cancelBackendWake();
    },
    [cancelBackendWake],
  );

  const syncBackendUser = useCallback(async () => {
    if (!isSignedIn) {
      setBackendUser(null);
      setBackendAuthStatus("idle");
      return;
    }

    const requestId = authSyncRequestRef.current + 1;
    authSyncRequestRef.current = requestId;
    setBackendAuthStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: await buildAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync user");
      }

      if (authSyncRequestRef.current === requestId) {
        setBackendUser(data.user || null);
        setBackendAuthStatus("ready");
        showNotice("Logged in successfully. Your real chats are now enabled.");
      }
    } catch (error) {
      console.error("User sync error:", error.message);

      if (authSyncRequestRef.current === requestId) {
        setBackendUser(null);
        setBackendAuthStatus("error");
        showNotice("Login succeeded, but the backend account connection failed.");
      }
    }
  }, [buildAuthHeaders, isSignedIn, showNotice]);

  const loadThreads = useCallback(async (preferredThreadId = "") => {
    if (!isSignedIn) {
      setThreads(DEMO_THREADS);
      setThreadsLoading(false);
      return;
    }

    if (backendAuthStatus !== "ready") {
      setThreads([]);
      setThreadsLoading(backendAuthStatus === "loading" || backendAuthStatus === "idle");
      return;
    }

    try {
      setThreadsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/thread`, {
        headers: await buildAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch threads");
      }

      const nextThreads = Array.isArray(data.threads) ? data.threads : [];
      setThreads(nextThreads);

      if (preferredThreadId) {
        setActiveThreadId(preferredThreadId);
        return;
      }

      if (activeThreadId && nextThreads.some((thread) => thread.threadId === activeThreadId)) {
        setActiveThreadId(activeThreadId);
      }
    } catch (error) {
      console.error("Thread fetch error:", error.message);
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, [activeThreadId, backendAuthStatus, buildAuthHeaders, isSignedIn]);

  const loadThreadMessages = useCallback(async (threadId) => {
    const requestId = threadLoadRequestRef.current + 1;
    threadLoadRequestRef.current = requestId;

    if (!threadId) {
      setMessages([]);
      setIsThreadLoading(false);
      return;
    }

    setIsThreadLoading(true);
    setMessages([]);

    if (!isSignedIn) {
      const demoThread = DEMO_THREADS.find((thread) => thread.threadId === threadId);
      await new Promise((resolve) => window.setTimeout(resolve, 450));

      if (threadLoadRequestRef.current === requestId) {
        setMessages(demoThread?.messages || []);
        setActiveThreadId(threadId);
        setIsThreadLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
        headers: await buildAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch thread");
      }

      if (threadLoadRequestRef.current === requestId) {
        setMessages(Array.isArray(data.thread?.messages) ? data.thread.messages : []);
        setActiveThreadId(threadId);
      }
    } catch (error) {
      console.error("Thread load error:", error.message);
    } finally {
      if (threadLoadRequestRef.current === requestId) {
        setIsThreadLoading(false);
      }
    }
  }, [buildAuthHeaders, isSignedIn]);

  const handleNewChat = () => {
    if (!isAuthenticated) {
      showNotice("Login first to start a real chat.");
      startBackendWake();
      return;
    }

    if (!isBackendReady) {
      showNotice("Your backend account connection is not ready.");
      return;
    }

    threadLoadRequestRef.current += 1;
    setIsThreadLoading(false);
    setActiveThreadId("");
    setThreadSelectionKey((currentValue) => currentValue + 1);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const countDemoThreadView = useCallback(async (threadId) => {
    if (!threadId.startsWith("demo-") || countedDemoViewsRef.current.has(threadId)) {
      return;
    }

    const sessionKey = `${DEMO_VIEW_SESSION_PREFIX}${threadId}`;

    try {
      if (window.sessionStorage.getItem(sessionKey) === "true") {
        countedDemoViewsRef.current.add(threadId);
        return;
      }
    } catch {
      // The in-memory set still prevents duplicate counts during this page visit.
    }

    countedDemoViewsRef.current.add(threadId);

    try {
      window.sessionStorage.setItem(sessionKey, "true");
    } catch {
      // Continue when browser storage is unavailable.
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/views/demo/${threadId}`, {
        method: "POST",
        headers: {
          "X-View-Session": getViewSessionId(),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update demo views");
      }

      setDemoViews((currentViews) => ({
        ...(currentViews || {}),
        [threadId]: data.views,
      }));
    } catch (error) {
      console.error("Demo view counter error:", error.message);
      countedDemoViewsRef.current.delete(threadId);

      try {
        window.sessionStorage.removeItem(sessionKey);
      } catch {
        // Ignore storage cleanup failures.
      }
    }
  }, []);

  const handleSelectThread = (threadId) => {
    if (!isAuthenticated) {
      countDemoThreadView(threadId);
    }

    setActiveThreadId(threadId);
    setThreadSelectionKey((currentValue) => currentValue + 1);
  };

  const handleDeleteThread = async (threadId) => {
    if (!isAuthenticated) {
      showNotice("This is demo chats. You cannot delete this. Please login first.");
      return;
    }

    if (!isBackendReady) {
      showNotice("Your backend account connection is not ready.");
      return;
    }

    try {
      setDeletingThreadId(threadId);
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
        method: "DELETE",
        headers: await buildAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete thread");
      }

      const remainingThreads = threads.filter((thread) => thread.threadId !== threadId);
      setThreads(remainingThreads);

      if (activeThreadId === threadId) {
        threadLoadRequestRef.current += 1;
        setIsThreadLoading(false);
        const nextActiveThreadId = remainingThreads[0]?.threadId || "";
        setActiveThreadId(nextActiveThreadId);

        if (!nextActiveThreadId) {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Thread delete error:", error.message);
    } finally {
      setDeletingThreadId("");
    }
  };

  const handleLogout = async () => {
    threadLoadRequestRef.current += 1;
    authSyncRequestRef.current += 1;
    setIsThreadLoading(false);
    await signOut();
    setBackendUser(null);
    setBackendAuthStatus("idle");
    setThreads(DEMO_THREADS);
    setActiveThreadId("");
    setMessages([]);
    showNotice("Logged out. You are viewing demo chats again.");
  };

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    loadThreads();
  }, [isAuthLoaded, loadThreads]);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (isSignedIn) {
      threadLoadRequestRef.current += 1;
      setIsThreadLoading(false);
      setThreads([]);
      syncBackendUser();
      setMessages([]);
      setActiveThreadId("");
      closeAuthModal();
      return;
    }

    authSyncRequestRef.current += 1;
    setBackendUser(null);
    setBackendAuthStatus("idle");
  }, [closeAuthModal, isAuthLoaded, isSignedIn, syncBackendUser]);

  useEffect(() => {
    if (activeThreadId) {
      loadThreadMessages(activeThreadId);
      setIsSidebarOpen(false);
    }
  }, [activeThreadId, loadThreadMessages]);

  useEffect(() => {
    const loadWebsiteViews = async () => {
      let hasCountedView = false;

      try {
        hasCountedView = window.sessionStorage.getItem(VIEW_SESSION_KEY) === "true";

        if (!hasCountedView) {
          window.sessionStorage.setItem(VIEW_SESSION_KEY, "true");
        }
      } catch {
        // Continue without session deduplication when browser storage is unavailable.
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/views`, {
          method: hasCountedView ? "GET" : "POST",
          headers: hasCountedView
            ? undefined
            : {
                "X-View-Session": getViewSessionId(),
              },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load website views");
        }

        setWebsiteViews(Number.isFinite(data.views) ? data.views : null);
      } catch (error) {
        console.error("Website view counter error:", error.message);

        if (!hasCountedView) {
          try {
            window.sessionStorage.removeItem(VIEW_SESSION_KEY);
          } catch {
            // Ignore storage cleanup failures.
          }
        }
      }
    };

    loadWebsiteViews();
  }, []);

  useEffect(() => {
    const loadDemoViews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/views/demo`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load demo views");
        }

        setDemoViews(data.views && typeof data.views === "object" ? data.views : {});
      } catch (error) {
        console.error("Demo views fetch error:", error.message);
      }
    };

    loadDemoViews();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {notice ? <div className="App-notice">{notice}</div> : null}
        <button
          className={`App-sidebar-backdrop${isSidebarOpen ? " App-sidebar-backdrop--open" : ""}`}
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          isDemoMode={!isAuthenticated}
          threads={threads}
          activeThreadId={activeThreadId}
          isLoading={threadsLoading}
          deletingThreadId={deletingThreadId}
          demoViews={demoViews}
          onNewChat={handleNewChat}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
        />
        <ChatWindow
          userName={backendUser?.name || clerkUser?.firstName || "Buddy"}
          isAuthenticated={isAuthenticated}
          isBackendReady={isBackendReady}
          websiteViews={websiteViews}
          activeThreadId={activeThreadId}
          threadSelectionKey={threadSelectionKey}
          messages={messages}
          isThreadLoading={isThreadLoading}
          setMessages={setMessages}
          buildAuthHeaders={buildAuthHeaders}
          onRequireLogin={() => {
            showNotice("You need to login first.");
            startBackendWake();
          }}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLoginClick={startBackendWake}
          onLogout={handleLogout}
          onShowNotice={showNotice}
          onThreadCreated={(threadId) => {
            setActiveThreadId(threadId);
            loadThreads(threadId);
          }}
          onRefreshThreads={() => loadThreads(activeThreadId)}
        />
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            backendWakeStatus={backendWakeStatus}
            secondsRemaining={backendWakeSecondsRemaining}
            onRetry={startBackendWake}
            onClose={closeAuthModal}
          />
        </Suspense>
      </header>
    </div>
  );
}

export default App;
