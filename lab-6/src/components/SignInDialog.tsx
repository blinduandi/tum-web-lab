// Token sign-in dialog. The user picks a role (and optionally an API base
// URL), we POST /token, store the JWT, and signal the parent to reload.

import { useState, type FormEvent } from "react";

import * as api from "../data/api";

interface SignInDialogProps {
  onSignedIn: () => void;
  onCancel: () => void;
}

const ROLES = ["GUEST", "READER", "EDITOR", "ADMIN"] as const;

export function SignInDialog({ onSignedIn, onCancel }: SignInDialogProps) {
  const [role, setRole] = useState<(typeof ROLES)[number]>("ADMIN");
  const [baseUrl, setBaseUrl] = useState(api.getApiBase());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      api.setApiBase(baseUrl);
      const res = await api.requestToken(role);
      api.setToken(res.token);
      onSignedIn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <p className="form-hint">
        Pagebound can store your shelf either in your browser (IndexedDB) or in the Lab 7
        REST API. Pick a role below to mint a JWT — tokens expire after 1 minute, so you
        may be asked to sign in again as you work.
      </p>

      <label className="field">
        <span>API Base URL</span>
        <input
          type="url"
          required
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <ul className="role-legend">
        <li><b>GUEST</b> No permissions</li>
        <li><b>READER</b> Read</li>
        <li><b>EDITOR</b> Read + Write</li>
        <li><b>ADMIN</b> Read + Write + Delete</li>
      </ul>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={busy}>
          {busy ? "Signing In" : "Sign In"}
        </button>
      </div>
    </form>
  );
}
