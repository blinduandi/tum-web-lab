// Tiny hash-based router. Two views — "home" and "library" — kept in sync
// with the URL hash so navigation is bookmarkable and the back button works.
// We avoid pulling in react-router-dom for one binary state.

import { useEffect, useState, useCallback } from "react";

export type Route = "home" | "library";

function readHash(): Route {
  return window.location.hash === "#/library" ? "library" : "home";
}

export function useRoute() {
  const [route, setRouteState] = useState<Route>(() => readHash());

  useEffect(() => {
    const onChange = () => setRouteState(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const target = next === "library" ? "#/library" : "#/";
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  }, []);

  return { route, navigate };
}
