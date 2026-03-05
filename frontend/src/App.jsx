import "./App.css";

import { useEffect, useState } from "react";
import CoursesPage from "./pages/CoursesPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function getPageFromHash() {
  const raw = String(window.location.hash || "").replace(/^#/, "");
  if (raw === "/courses") return "courses";
  return "students";
}

export default function App() {
  const [page, setPage] = useState(() => getPageFromHash());
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar__left">
          <div className="brand">
            <span className="badge">Capstone Demo</span>
            <h1 className="brand__title">Student Registries</h1>
          </div>
          <p className="subhead">React UI → Node.js API → MySQL</p>
        </div>

        <div className="topbar__right">
          <div className="segmented" role="navigation" aria-label="Pages">
            <a
              className={page === "students" ? "segmented__btn is-active" : "segmented__btn"}
              href="#/students"
            >
              Students
            </a>
            <a
              className={page === "courses" ? "segmented__btn is-active" : "segmented__btn"}
              href="#/courses"
            >
              Courses
            </a>
          </div>
          <button
            type="button"
            className={theme === "dark" ? "themeToggle is-dark" : "themeToggle"}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <span className="themeToggle__label">{theme === "dark" ? "Dark" : "Light"}</span>
            <span className="themeToggle__track" aria-hidden="true">
              <span className="themeToggle__thumb" />
            </span>
          </button>
        </div>
      </header>

      {!API && (
        <div className="alert alert--warning" role="status">
          <div className="alert__title">Backend not configured</div>
          <div className="alert__body">
            Set <code>VITE_API_URL</code> in <code>frontend/.env</code> (example:{" "}
            <code>http://localhost:3000</code>) then restart <code>npm run dev</code>.
          </div>
        </div>
      )}

      {page === "courses" ? <CoursesPage apiBase={API} /> : <StudentsPage apiBase={API} />}

      <footer className="footer">
        <span className="muted">
          Tip: set <code>VITE_API_URL</code> to point at your backend.
        </span>
      </footer>
    </div>
  );
}