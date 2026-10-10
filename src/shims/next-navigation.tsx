// ============================================================
// FILE: src/shims/next-navigation.tsx
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface NavigationContextValue {
  pathname: string;
  search: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  pathname: '/',
  search: '',
  push: () => {},
  replace: () => {},
  back: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [search, setSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search || '' : ''
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const push = useCallback((href: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(href, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setPathname(url.pathname || '/');
    setSearch(url.search || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const replace = useCallback((href: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(href, window.location.origin);
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    setPathname(url.pathname || '/');
    setSearch(url.search || '');
  }, []);

  const back = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ pathname, search, push, replace, back }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(NavigationContext);
  return {
    push: ctx.push,
    replace: ctx.replace,
    back: ctx.back,
    prefetch: () => {},
  };
}

export function usePathname(): string {
  return useContext(NavigationContext).pathname;
}

export function useSearchParams(): URLSearchParams {
  const { search } = useContext(NavigationContext);
  return new URLSearchParams(search);
}
