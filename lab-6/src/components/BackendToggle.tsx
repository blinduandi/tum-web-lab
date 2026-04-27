// Tiny header control that flips between local and remote backends.
// "Local" = data lives in IndexedDB. "API" = data lives on the Lab 7 server.

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
      className={`pill-button ${isRemote ? "is-active" : ""}`}
      onClick={handleClick}
      title={
        isRemote
          ? "Connected to API — click to switch to local"
          : "Stored in browser — click to connect to API"
      }
      aria-pressed={isRemote}
    >
      <span className="pill-button__glyph" aria-hidden="true">
        {isRemote ? "☁" : "⌂"}
      </span>
      <span>{isRemote ? "API" : "Local"}</span>
    </button>
  );
}
