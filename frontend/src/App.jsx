import { useAuth, useUser } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Slidbar from "./Slidbar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import AuthModal from "./AuthModal.jsx";
import { DEMO_THREADS } from "./demoChats.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [backendUser, setBackendUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [threadSelectionKey, setThreadSelectionKey] = useState(0);
  const [messages, setMessages] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const isAuthenticated = Boolean(isSignedIn);

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.clearTimeout(showNotice.timeoutId);
    showNotice.timeoutId = window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const buildAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  const syncBackendUser = useCallback(async () => {
    if (!isSignedIn) {
      setBackendUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: await buildAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync user");
      }

      setBackendUser(data.user || null);
    } catch (error) {
      console.error("User sync error:", error.message);
    }
  }, [buildAuthHeaders, isSignedIn]);

  const loadThreads = useCallback(async (preferredThreadId = "") => {
    if (!isSignedIn) {
      setThreads(DEMO_THREADS);
      setThreadsLoading(false);
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
  }, [activeThreadId, buildAuthHeaders, isSignedIn]);

  const loadThreadMessages = useCallback(async (threadId) => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    if (!isSignedIn) {
      const demoThread = DEMO_THREADS.find((thread) => thread.threadId === threadId);
      setMessages(demoThread?.messages || []);
      setActiveThreadId(threadId);
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

      setMessages(Array.isArray(data.thread?.messages) ? data.thread.messages : []);
      setActiveThreadId(threadId);
    } catch (error) {
      console.error("Thread load error:", error.message);
    }
  }, [buildAuthHeaders, isSignedIn]);

  const handleNewChat = () => {
    if (!isAuthenticated) {
      showNotice("Login first to start a real chat.");
      setIsAuthModalOpen(true);
      return;
    }

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
        headers: await buildAuthHeaders(),
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

  const handleLogout = async () => {
    await signOut();
    setBackendUser(null);
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
      setThreads([]);
      syncBackendUser();
      setMessages([]);
      setActiveThreadId("");
      setIsAuthModalOpen(false);
      showNotice("Logged in successfully. Your real chats are now enabled.");
      return;
    }

    setBackendUser(null);
  }, [isAuthLoaded, isSignedIn, showNotice, syncBackendUser]);

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
          userName={backendUser?.name || clerkUser?.firstName || "Buddy"}
          isAuthenticated={isAuthenticated}
          activeThreadId={activeThreadId}
          threadSelectionKey={threadSelectionKey}
          messages={messages}
          setMessages={setMessages}
          buildAuthHeaders={buildAuthHeaders}
          onRequireLogin={() => {
            showNotice("You need to login first.");
            setIsAuthModalOpen(true);
          }}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onShowNotice={showNotice}
          onThreadCreated={(threadId) => {
            setActiveThreadId(threadId);
            loadThreads(threadId);
          }}
          onRefreshThreads={() => loadThreads(activeThreadId)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </header>
    </div>
  );
}

export default App;
