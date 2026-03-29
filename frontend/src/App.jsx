import { useEffect, useState } from "react";
import "./App.css";
import Slidbar from "./Slidbar.jsx";
import ChatWindow from "./ChatWindow.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messages, setMessages] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [deletingThreadId, setDeletingThreadId] = useState("");

  const loadThreads = async (preferredThreadId = "") => {
    try {
      setThreadsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/thread`);
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

      if (!activeThreadId && nextThreads.length > 0) {
        setActiveThreadId(nextThreads[0].threadId);
      }
    } catch (error) {
      console.error("Thread fetch error:", error.message);
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadThreadMessages = async (threadId) => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch thread");
      }

      setMessages(Array.isArray(data.thread?.messages) ? data.thread.messages : []);
      setActiveThreadId(threadId);
    } catch (error) {
      console.error("Thread load error:", error.message);
    }
  };

  const handleNewChat = () => {
    setActiveThreadId("");
    setMessages([]);
  };

  const handleDeleteThread = async (threadId) => {
    try {
      setDeletingThreadId(threadId);
      const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
        method: "DELETE",
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

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      loadThreadMessages(activeThreadId);
    }
  }, [activeThreadId]);

  return (
    <div className="App">
      <header className="App-header">
        <Slidbar
          threads={threads}
          activeThreadId={activeThreadId}
          isLoading={threadsLoading}
          deletingThreadId={deletingThreadId}
          onNewChat={handleNewChat}
          onSelectThread={setActiveThreadId}
          onDeleteThread={handleDeleteThread}
        />
        <ChatWindow
          activeThreadId={activeThreadId}
          messages={messages}
          setMessages={setMessages}
          onThreadCreated={(threadId) => {
            setActiveThreadId(threadId);
            loadThreads(threadId);
          }}
          onRefreshThreads={() => loadThreads(activeThreadId)}
        />
      </header>
    </div>
  );
}

export default App;
