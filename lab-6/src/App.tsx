import { useCallback, useEffect, useRef, useState } from "react";

import { ThemeToggle } from "./components/ThemeToggle";
import { BackendToggle } from "./components/BackendToggle";
import { SignInDialog } from "./components/SignInDialog";
import { Modal } from "./components/Modal";

import { useLibrary } from "./data/LibraryContext";
import { Home } from "./views/Home";
import { Library } from "./views/Library";
import { useRoute, type Route } from "./views/useRoute";

export default function App() {
  const { backend, apiAuthRequired, setBackend, acknowledgeAuth } = useLibrary();
  const { route, navigate } = useRoute();
  const [signInOpen, setSignInOpen] = useState(false);

  // The Library view exposes its "open Add" handler back up to App so the
  // top-level "+ Add" button in the nav can trigger it from anywhere.
  const addRef = useRef<(() => void) | null>(null);
  const openAdd = useCallback(() => {
    if (route !== "library") navigate("library");
    // Defer one tick so Library has a chance to register if we just routed.
    setTimeout(() => addRef.current?.(), 0);
  }, [route, navigate]);

  useEffect(() => {
    if (apiAuthRequired) setSignInOpen(true);
  }, [apiAuthRequired]);

  function handleSignInCancel() {
    setSignInOpen(false);
    acknowledgeAuth();
    if (apiAuthRequired) setBackend("local");
  }

  function handleSignedIn() {
    setSignInOpen(false);
    acknowledgeAuth();
    setBackend(backend);
  }

  return (
    <div className="app">
      <TopNav
        route={route}
        onNavigate={navigate}
        onAdd={openAdd}
        onSignInRequest={() => setSignInOpen(true)}
      />

      {route === "home" ? (
        <Home onEnter={() => navigate("library")} />
      ) : (
        <main className="library-shell">
          <Library
            onOpenAdd={openAdd}
            registerAddHandler={(handler) => {
              addRef.current = handler;
            }}
          />
          <footer className="library-footer">
            <span className="caption-mono caption-mono--mid">
              Built for FAF Web Programming · Lab 06
            </span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("home")}
            >
              ← Back to homepage
            </button>
          </footer>
        </main>
      )}

      <Modal
        open={signInOpen}
        title="Connect to Pagebound API"
        onClose={handleSignInCancel}
      >
        <SignInDialog onSignedIn={handleSignedIn} onCancel={handleSignInCancel} />
      </Modal>
    </div>
  );
}

interface TopNavProps {
  route: Route;
  onNavigate: (r: Route) => void;
  onAdd: () => void;
  onSignInRequest: () => void;
}

function TopNav({ route, onNavigate, onAdd, onSignInRequest }: TopNavProps) {
  return (
    <nav className="top-nav" aria-label="Primary">
      <div className="top-nav__left">
        <button
          type="button"
          className={`nav-link ${route === "home" ? "is-active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={`nav-link ${route === "library" ? "is-active" : ""}`}
          onClick={() => onNavigate("library")}
        >
          Library
        </button>
      </div>
      <div className="top-nav__brand">Pagebound</div>
      <div className="top-nav__right">
        <button type="button" className="nav-link" onClick={onAdd}>
          + Add
        </button>
        <BackendToggle onSignInRequest={onSignInRequest} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
