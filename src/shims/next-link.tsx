// ============================================================
// FILE: src/shims/next-link.tsx
// ============================================================

import React from 'react';
import { useRouter } from './next-navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, onClick, children, ...rest }: LinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      href.startsWith('http') ||
      href.startsWith('#')
    ) {
      return;
    }
    e.preventDefault();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
