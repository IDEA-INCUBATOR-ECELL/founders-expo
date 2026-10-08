import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import {
  listSubmissions,
  dismissSubmission,
  submissionEvent,
} from "./submission-outbox.js";
const names = {
  "/applications": "Startup application",
  "/ideas": "Idea submission",
  "/feedback": "Feedback",
  "/join": "Team introduction",
};
export function SubmissionRecovery() {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(null);
  const load = () =>
    listSubmissions()
      .then(setRows)
      .catch(() => {});
  useEffect(() => {
    load();
    window.addEventListener(submissionEvent, load);
    return () => window.removeEventListener(submissionEvent, load);
  }, []);
  if (!rows.length) return null;
  const pending = rows.filter((r) => r.state === "pending");
  return (
    <details className="submission-recovery container">
      <summary>
        {pending.length
          ? pending.length + " submission(s) awaiting confirmation"
          : "Your submission records"}{" "}
        <span>Review & recover</span>
      </summary>
      <p>
        A receipt confirms that your submission is saved. If the connection
        failed, retry the same submission safely below.
      </p>
      {rows.map((row) => (
        <div className="recovery-row" key={row.key}>
          <div>
            <strong>
              {names[row.route]}
              {row.body?.name ? " · " + row.body.name : ""}
            </strong>
            <small>
              {new Date(row.createdAt).toLocaleString()} ·{" "}
              {row.state === "saved"
                ? "Saved successfully"
                : "Awaiting confirmation"}
            </small>
            {row.state === "rejected" && (
              <p className="field-error">
                {row.error} Update your form and submit it again.
              </p>
            )}
            {row.receipt?.id && (
              <p>
                Reference: <strong>{row.receipt.id}</strong>
              </p>
            )}
            {row.receipt?.token && (
              <label>
                Private tracking code
                <input
                  readOnly
                  value={row.receipt.token}
                  onFocus={(e) => e.target.select()}
                />
              </label>
            )}
          </div>
          {row.state === "pending" ? (
            <button
              className="btn btn-primary"
              disabled={!!busy}
              onClick={async () => {
                setBusy(row.key);
                setError("");
                try {
                  await api(row.route, {
                    method: "POST",
                    body: row.body,
                    retryKey: row.key,
                  });
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === row.key ? "Retrying…" : "Retry submission"}
            </button>
          ) : (
            <button
              className="text-btn"
              onClick={() => dismissSubmission(row.key)}
            >
              {row.state === "saved" ? "Dismiss receipt" : "Dismiss record"}
            </button>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </details>
  );
}
