import { useEffect, useState } from "react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function splitFullName(fullNameRaw) {
  const fullName = String(fullNameRaw || "").trim().replace(/\s+/g, " ");
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ").trim();
  return { firstName, lastName: lastName || "" };
}

function displayFullName(student) {
  const firstName = String(student?.firstName || "").trim();
  const lastName = String(student?.lastName || "").trim();
  const joined = [firstName, lastName].filter(Boolean).join(" ").trim();
  return joined || String(student?.fullName || "").trim() || "—";
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setError("");
    if (!API) {
      setStudents([]);
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/students`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load students (HTTP ${res.status})`);
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  }

  async function addStudent(e) {
    e.preventDefault();
    setError("");
    if (!API) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          course: course.trim(),
          yearLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add student");
      }

      setFirstName("");
      setLastName("");
      setCourse("");
      setYearLevel(1);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to add student");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStudent(e) {
    e.preventDefault();
    setError("");
    if (!API) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }
    if (!editingId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API}/api/students/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          course: course.trim(),
          yearLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update student");
      }

      setEditingId(null);
      setFirstName("");
      setLastName("");
      setCourse("");
      setYearLevel(1);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update student");
    } finally {
      setIsSaving(false);
    }
  }

  function beginEdit(student) {
    setError("");
    setEditingId(student.id);
    const parsed = splitFullName(student?.fullName);
    setFirstName(String(student?.firstName || parsed.firstName || "").trim());
    setLastName(String(student?.lastName || parsed.lastName || "").trim());
    setCourse(student.course || "");
    setYearLevel(Number(student.yearLevel || 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setError("");
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setCourse("");
    setYearLevel(1);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar__left">
          <div className="brand">
            <span className="badge">Capstone Demo</span>
            <h1 className="brand__title">Student Registry</h1>
          </div>
          <p className="subhead">React UI → Node.js API → MySQL</p>
        </div>

        <div className="topbar__right">
          <button
            type="button"
            className="button button--ghost"
            onClick={load}
            disabled={isLoading || !API}
            title={!API ? "Missing VITE_API_URL" : "Refresh list"}
          >
            {isLoading ? "Refreshing…" : "Refresh"}
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

      {error && (
        <div className="alert alert--error" role="alert">
          <div className="alert__title">Something went wrong</div>
          <div className="alert__body">{error}</div>
        </div>
      )}

      <main className="grid">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">
              {editingId ? `Edit student #${editingId}` : "Add student"}
            </h2>
            <p className="card__subtitle">
              {editingId ? "Update an existing student record." : "Create a new student record."}
            </p>
          </div>

          <form className="form" onSubmit={editingId ? updateStudent : addStudent}>
            <div className="field">
              <label className="label" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className="input"
                placeholder="e.g. Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
                disabled={isSaving}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className="input"
                placeholder="e.g. Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
                disabled={isSaving}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="course">
                Course
              </label>
              <input
                id="course"
                className="input"
                placeholder="e.g. BSIT"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="yearLevel">
                Year level
              </label>
              <select
                id="yearLevel"
                className="select"
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value))}
                disabled={isSaving}
              >
                <option value={1}>1st year</option>
                <option value={2}>2nd year</option>
                <option value={3}>3rd year</option>
                <option value={4}>4th year</option>
                <option value={5}>5th year</option>
              </select>
            </div>

            <div className="form__row">
              <button
                type="submit"
                className="button button--primary"
                disabled={
                  isSaving ||
                  !API ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !course.trim()
                }
                title={!API ? "Missing VITE_API_URL" : editingId ? "Save changes" : "Add student"}
              >
                {isSaving ? (editingId ? "Saving…" : "Adding…") : editingId ? "Save changes" : "Add student"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              )}
              <span className="muted">
                {isSaving ? "Saving to API…" : "Fields marked required."}
              </span>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card__header card__header--row">
            <div>
              <h2 className="card__title">Students</h2>
              <p className="card__subtitle">Latest records from the API.</p>
            </div>
            <span className="pill" title="Total students">
              {students.length}
            </span>
          </div>

          {isLoading ? (
            <div className="skeleton">
              <div className="skeleton__line" />
              <div className="skeleton__line" />
              <div className="skeleton__line" />
              <div className="skeleton__line" />
            </div>
          ) : students.length === 0 ? (
            <div className="empty">
              <div className="empty__title">No students yet</div>
              <div className="empty__body">Add your first record using the form.</div>
            </div>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>ID</th>
                    <th>Name</th>
                    <th style={{ width: 120 }}>Course</th>
                    <th style={{ width: 96 }}>Year</th>
                    <th style={{ width: 110 }} />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">#{s.id}</td>
                      <td>{displayFullName(s)}</td>
                      <td className="mono">{s.course}</td>
                      <td>Year {s.yearLevel}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="button button--ghost button--sm"
                          onClick={() => beginEdit(s)}
                          disabled={isSaving}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <span className="muted">
          Tip: set <code>VITE_API_URL</code> to point at your backend.
        </span>
      </footer>
    </div>
  );
}