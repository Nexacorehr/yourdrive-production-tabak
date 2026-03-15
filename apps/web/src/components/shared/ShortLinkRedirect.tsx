import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import api from "../../lib/axios";

/**
 * Resolves /s/:shortId to /shared/:token and redirects.
 * Short links are minimized share URLs (e.g. /s/abc12XY).
 */
export default function ShortLinkRedirect() {
  const { shortId } = useParams({ strict: false });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) {
      setError("Invalid link");
      return;
    }

    let cancelled = false;

    api
      .get(`/sharing/resolve-short/${shortId}`)
      .then((res) => {
        if (cancelled) return;
        const token = res.data?.shareToken;
        if (token) {
          navigate({ to: "/shared/$token", params: { token } });
        } else {
          setError("Share not found");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Share not found or expired");
      });

    return () => {
      cancelled = true;
    };
  }, [shortId, navigate]);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Redirecting...</p>
    </div>
  );
}
