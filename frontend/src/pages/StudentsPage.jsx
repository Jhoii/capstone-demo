import { useEffect, useState } from "react";

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

export default function StudentsPage({ apiBase }) {
  const [students, setStudents] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setError("");
    if (!apiBase) {
      setStudents([]);
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/students`);
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
    if (!apiBase) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/students`, {
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
    if (!apiBase) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }
    if (!editingId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/students/${editingId}`, {
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

  async function deleteStudent(student) {
    setError("");
    if (!apiBase) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }
    if (!student?.id) return;

    const ok = window.confirm(`Delete student #${student.id} (${displayFullName(student)})?`);
    if (!ok) return;

    setDeletingId(student.id);
    try {
      const res = await fetch(`${apiBase}/api/students/${student.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete student");
      }

      if (editingId === student.id) {
        cancelEdit();
      }

      await load();
    } catch (e) {
      setError(e?.message || "Failed to delete student");
    } finally {
      setDeletingId(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                  !apiBase ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !course.trim()
                }
                title={!apiBase ? "Missing VITE_API_URL" : editingId ? "Save changes" : "Add student"}
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
              <button
                type="button"
                className="button button--ghost"
                onClick={load}
                disabled={isLoading || !apiBase}
              >
                {isLoading ? "Refreshing…" : "Refresh"}
              </button>
              <span className="muted">{isSaving ? "Saving to API…" : "Fields marked required."}</span>
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
                    <th style={{ width: 190 }} />
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
                        <div className="rowActions">
                          <button
                            type="button"
                            className="button button--ghost button--sm"
                            onClick={() => beginEdit(s)}
                            disabled={isSaving || deletingId === s.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button button--danger button--sm"
                            onClick={() => deleteStudent(s)}
                            disabled={isSaving || deletingId === s.id}
                            title="Delete student"
                          >
                            {deletingId === s.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

