import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Slidbar from "./Slidbar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import AuthModal from "./AuthModal.jsx";
import { DEMO_THREADS } from "./demoChats.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const AUTH_STORAGE_KEY = "pippogpt_auth";

const getStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [threads, setThreads] = useState(DEMO_THREADS);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [threadSelectionKey, setThreadSelectionKey] = useState(0);
  const [messages, setMessages] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");

  const isAuthenticated = Boolean(auth?.token);

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.clearTimeout(showNotice.timeoutId);
    showNotice.timeoutId = window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${auth?.token}`,
    }),
    [auth?.token],
  );

  const loadThreads = useCallback(async (preferredThreadId = "") => {
    if (!auth?.token) {
      setThreads(DEMO_THREADS);
      setThreadsLoading(false);
      return;
    }

    try {
      setThreadsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/thread`, {
        headers: authHeaders(),
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
    } finally {
      setThreadsLoading(false);
    }
  }, [activeThreadId, auth?.token, authHeaders]);

  const loadThreadMessages = useCallback(async (threadId) => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    if (!auth?.token) {
      const demoThread = DEMO_THREADS.find((thread) => thread.threadId === threadId);
      setMessages(demoThread?.messages || []);
      setActiveThreadId(threadId);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
        headers: authHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch thread");
      }

      setMessages(Array.isArray(data.thread?.messages) ? data.thread.messages : []);
      setActiveThreadId(threadId);
    } catch (error) {
      console.error("Thread load error:", error.message);
    }
  }, [auth?.token, authHeaders]);

  const handleNewChat = () => {
    setActiveThreadId("");
    setThreadSelectionKey((currentValue) => currentValue + 1);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSelectThread = (threadId) => {
    setActiveThreadId(threadId);
    setThreadSelectionKey((currentValue) => currentValue + 1);
  };

  const handleDeleteThread = async (threadId) => {
    if (!isAuthenticated) {
      showNotice("This is demo chats. You cannot delete this. Please login first.");
      return;
    }

    try {
      setDeletingThreadId(threadId);
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete thread");
      }

      const remainingThreads = threads.filter((thread) => thread.threadId !== threadId);
      setThreads(remainingThreads);

      if (activeThreadId === threadId) {
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

  const handleAuthSubmit = async (mode, form) => {
    setAuthError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const nextAuth = {
        token: data.token,
        user: data.user,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      setMessages([]);
      setActiveThreadId("");
      setIsAuthModalOpen(false);
      showNotice("Logged in successfully. Your real chats are now enabled.");
    } catch (error) {
      setAuthError(error.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setThreads(DEMO_THREADS);
    setActiveThreadId("");
    setMessages([]);
    showNotice("Logged out. You are viewing demo chats again.");
  };

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (activeThreadId) {
      loadThreadMessages(activeThreadId);
      setIsSidebarOpen(false);
    }
  }, [activeThreadId, loadThreadMessages]);

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
        <Slidbar
          isOpen={isSidebarOpen}
          isDemoMode={!isAuthenticated}
          threads={threads}
          activeThreadId={activeThreadId}
          isLoading={threadsLoading}
          deletingThreadId={deletingThreadId}
          onNewChat={handleNewChat}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
        />
        <ChatWindow
          userName={auth?.user?.name || "Buddy"}
          isAuthenticated={isAuthenticated}
          activeThreadId={activeThreadId}
          threadSelectionKey={threadSelectionKey}
          messages={messages}
          setMessages={setMessages}
          authHeaders={authHeaders}
          onRequireLogin={() => {
            showNotice("You need to login first.");
            setIsAuthModalOpen(true);
          }}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onThreadCreated={(threadId) => {
            setActiveThreadId(threadId);
            loadThreads(threadId);
          }}
          onRefreshThreads={() => loadThreads(activeThreadId)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSubmit={handleAuthSubmit}
          error={authError}
        />
      </header>
    </div>
  );
}

export default App;
