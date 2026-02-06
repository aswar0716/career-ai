"use client";

import { useEffect, useState } from "react";

type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

type JobApplication = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  url: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string | null;
};

const STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export default function Home() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("APPLIED");
  const [location, setLocation] = useState("");

  async function loadApps() {
    setLoading(true);
    const res = await fetch("/api/applications");
    const data = (await res.json()) as JobApplication[];
    setApps(data);
    setLoading(false);
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company,
        role,
        status,
        location: location.trim() ? location : null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Failed");
      return;
    }

    setCompany("");
    setRole("");
    setStatus("APPLIED");
    setLocation("");
    await loadApps();
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Career AI Dashboard</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Track job applications. This is the MVP.
      </p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #333", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add application</h2>

        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            placeholder="Company (required)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
          />
          <input
            placeholder="Role (required)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
          />
          <input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #333",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Applications</h2>

        {loading ? (
          <p style={{ marginTop: 12 }}>Loading...</p>
        ) : apps.length === 0 ? (
          <p style={{ marginTop: 12 }}>No applications yet. Add one above.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {apps.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #333",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>
                    {a.company} — {a.role}
                  </div>
                  <div style={{ opacity: 0.8 }}>{a.status}</div>
                </div>
                <div style={{ opacity: 0.8 }}>
                  {a.location ? a.location : "Location: n/a"} • Applied{" "}
                  {new Date(a.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
