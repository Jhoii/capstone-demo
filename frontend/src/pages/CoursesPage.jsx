import { useEffect, useState } from "react";

export default function CoursesPage({ apiBase }) {
  const [courses, setCourses] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadCourses() {
    setError("");
    if (!apiBase) {
      setCourses([]);
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/courses`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load courses (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setCode("");
    setName("");
    setIsActive(true);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!apiBase) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        isActive,
      };

      const url = editingId ? `${apiBase}/api/courses/${editingId}` : `${apiBase}/api/courses`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || (editingId ? "Failed to update course" : "Failed to create course"));
      }

      resetForm();
      await loadCourses();
    } catch (e) {
      setError(e?.message || "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  }

  function beginEdit(course) {
    setError("");
    setEditingId(course.id);
    setCode(course.code || "");
    setName(course.name || "");
    setIsActive(Boolean(course.isActive));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCourse(course) {
    setError("");
    if (!apiBase) {
      setError("Missing VITE_API_URL. Add it to `frontend/.env` then restart the dev server.");
      return;
    }
    if (!course?.id) return;

    const ok = window.confirm(`Delete course ${course.code}?`);
    if (!ok) return;

    setDeletingId(course.id);
    try {
      const res = await fetch(`${apiBase}/api/courses/${course.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete course");
      }
      if (editingId === course.id) resetForm();
      await loadCourses();
    } catch (e) {
      setError(e?.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadCourses();
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
            <h2 className="card__title">{editingId ? `Edit course #${editingId}` : "Add course"}</h2>
            <p className="card__subtitle">Manage the list of available courses.</p>
          </div>

          <form className="form" onSubmit={submit}>
            <div className="field">
              <label className="label" htmlFor="courseCode">
                Course code
              </label>
              <input
                id="courseCode"
                className="input"
                placeholder="e.g. BSIT"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="courseName">
                Course name
              </label>
              <input
                id="courseName"
                className="input"
                placeholder="e.g. Bachelor of Science in Information Technology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
              />
              <span>Active</span>
            </label>

            <div className="form__row">
              <button
                type="submit"
                className="button button--primary"
                disabled={isSaving || !apiBase || !code.trim() || !name.trim()}
                title={!apiBase ? "Missing VITE_API_URL" : editingId ? "Save changes" : "Create course"}
              >
                {isSaving ? (editingId ? "Saving…" : "Creating…") : editingId ? "Save changes" : "Create course"}
              </button>
              {editingId && (
                <button type="button" className="button button--ghost" onClick={resetForm} disabled={isSaving}>
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="button button--ghost"
                onClick={loadCourses}
                disabled={isLoading || !apiBase}
              >
                {isLoading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card__header card__header--row">
            <div>
              <h2 className="card__title">Courses</h2>
              <p className="card__subtitle">Saved course records.</p>
            </div>
            <span className="pill" title="Total courses">
              {courses.length}
            </span>
          </div>

          {isLoading ? (
            <div className="skeleton">
              <div className="skeleton__line" />
              <div className="skeleton__line" />
              <div className="skeleton__line" />
              <div className="skeleton__line" />
            </div>
          ) : courses.length === 0 ? (
            <div className="empty">
              <div className="empty__title">No courses yet</div>
              <div className="empty__body">Create your first course using the form.</div>
            </div>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Code</th>
                    <th>Name</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 160 }} />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.code}</td>
                      <td>{c.name}</td>
                      <td>{c.isActive ? "Active" : "Inactive"}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="rowActions">
                          <button
                            type="button"
                            className="button button--ghost button--sm"
                            onClick={() => beginEdit(c)}
                            disabled={isSaving || deletingId === c.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button button--danger button--sm"
                            onClick={() => deleteCourse(c)}
                            disabled={isSaving || deletingId === c.id}
                          >
                            {deletingId === c.id ? "Deleting…" : "Delete"}
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

