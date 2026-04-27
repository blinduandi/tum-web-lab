// Tiny header control that flips between local and remote backends.
// In local mode the icon is filled-in (you're "anchored" to your device);
// in remote mode it shows a cloud (we're talking to the API).

import { useLibrary } from "../data/LibraryContext";

export function BackendToggle({ onSignInRequest }: { onSignInRequest: () => void }) {
  const { backend, setBackend } = useLibrary();
  const isRemote = backend === "remote";

  function handleClick() {
    if (isRemote) {
      setBackend("local");
    } else {
      // Switch first so the LibraryContext loads the remote view; if no
      // token is present it'll set apiAuthRequired which opens the dialog.
      setBackend("remote");
      onSignInRequest();
    }
  }

  return (
    <button
      type="button"
      className={`backend-toggle ${isRemote ? "is-remote" : ""}`}
      onClick={handleClick}
      title={isRemote ? "Connected to API — click to switch to local" : "Stored in browser — click to connect to API"}
      aria-pressed={isRemote}
    >
      <span aria-hidden="true">{isRemote ? "☁" : "⌂"}</span>
      <span className="backend-toggle__label">{isRemote ? "API" : "Local"}</span>
    </button>
  );
}
