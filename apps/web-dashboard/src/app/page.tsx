'use client'

import { useEffect, useMemo, useState } from 'react'

type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'

type JobApplication = {
  id: string
  company: string
  role: string
  location: string | null
  url: string | null
  status: ApplicationStatus
  appliedAt: string
  notes: string | null
}

const STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
]

export default function Home() {
  const [apps, setApps] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED')
  const [location, setLocation] = useState('')

  const [filterStatus, setFilterStatus] = useState<'ALL' | ApplicationStatus>(
    'ALL',
  )

  const fetchUrl = useMemo(() => {
    if (filterStatus === 'ALL') return '/api/applications'
    return `/api/applications?status=${encodeURIComponent(filterStatus)}`
  }, [filterStatus])

  async function loadApps() {
    setLoading(true)
    const res = await fetch(fetchUrl)
    const data = (await res.json()) as JobApplication[]
    setApps(data)
    setLoading(false)
  }

  useEffect(() => {
    loadApps()
  }, [fetchUrl])

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        status,
        location: location.trim() ? location : null,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? 'Failed')
      return
    }

    setCompany('')
    setRole('')
    setStatus('APPLIED')
    setLocation('')
    await loadApps()
  }

  async function updateStatus(id: string, newStatus: ApplicationStatus) {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      alert('Failed to update status')
      return
    }

    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    )
  }

  async function deleteApp(id: string) {
    const ok = confirm('Delete this application?')
    if (!ok) return

    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Failed to delete')
      return
    }

    setApps((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Career AI Dashboard</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Track applications. Update status. Filter. Delete.
      </p>

      <section
        style={{
          marginTop: 18,
          padding: 16,
          border: '1px solid #333',
          borderRadius: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 600 }}>Filter</div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{ padding: 10, borderRadius: 10, border: '1px solid #333' }}
        >
          <option value="ALL">ALL</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      <section
        style={{
          marginTop: 18,
          padding: 16,
          border: '1px solid #333',
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add application</h2>

        <form
          onSubmit={submit}
          style={{ display: 'grid', gap: 12, marginTop: 12 }}
        >
          <input
            placeholder="Company (required)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #333' }}
          />
          <input
            placeholder="Role (required)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #333' }}
          />
          <input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #333' }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #333' }}
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
              border: '1px solid #333',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </form>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Applications</h2>

        {loading ? (
          <p style={{ marginTop: 12 }}>Loading...</p>
        ) : apps.length === 0 ? (
          <p style={{ marginTop: 12 }}>No applications yet.</p>
        ) : (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {apps.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #333',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {a.company} • {a.role}
                  </div>

                  <div
                    style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                  >
                    <select
                      value={a.status}
                      onChange={(e) =>
                        updateStatus(a.id, e.target.value as ApplicationStatus)
                      }
                      style={{
                        padding: 8,
                        borderRadius: 10,
                        border: '1px solid #333',
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteApp(a.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #333',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ opacity: 0.8 }}>
                  {a.location ? a.location : 'Location: n/a'} • Applied{' '}
                  {new Date(a.appliedAt).toLocaleDateString()}
                </div>

                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ opacity: 0.9 }}
                  >
                    {a.url}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
;

