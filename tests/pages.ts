export interface PageLink {
  path: string;
  label: string;
}

export const PAGES: PageLink[] = [
  { path: '/experience', label: 'Experience' },
  { path: '/skills', label: 'Skills' },
  { path: '/certifications', label: 'Certifications' },
  { path: '/education', label: 'Education' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
  { path: '/now', label: 'Now' },
  { path: '/playground', label: 'Playground' },
  { path: '/resume', label: 'Resume' },
  { path: '/contact', label: 'Contact' },
];
