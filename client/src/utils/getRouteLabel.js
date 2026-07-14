const ROUTE_LABELS = [
  { match: (pathname) => pathname === '/', label: 'Home' },
  { match: (pathname) => pathname.startsWith('/dashboard'), label: 'Dashboard' },
  { match: (pathname) => pathname.startsWith('/explore'), label: 'Explore' },
  { match: (pathname) => pathname.startsWith('/create-journal-entry'), label: 'Journal' },
  { match: (pathname) => pathname.startsWith('/edit-node-entry'), label: 'Edit Node' },
  { match: (pathname) => pathname.startsWith('/profile'), label: 'Profile' },
  { match: (pathname) => pathname.startsWith('/history'), label: 'History' },
  { match: (pathname) => pathname.startsWith('/resources'), label: 'Resources' },
  { match: (pathname) => pathname.startsWith('/modes'), label: 'Modes' },
  { match: (pathname) => pathname.startsWith('/about'), label: 'About' },
  { match: (pathname) => pathname.startsWith('/view-network'), label: 'Network' },
  { match: (pathname) => pathname.startsWith('/show-node-entry'), label: 'Public Node' },
  { match: (pathname) => pathname.startsWith('/public-dashboard'), label: 'Public Dashboard' },
  { match: (pathname) => pathname.startsWith('/login'), label: 'Login' },
  { match: (pathname) => pathname.startsWith('/register'), label: 'Register' },
]

export const getRouteLabel = (pathname = '') => {
  const match = ROUTE_LABELS.find((route) => route.match(pathname))
  return match?.label ?? 'Back'
}
