import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Header = ({ currentUser }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.body.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter(Boolean)
    .map(({ label, href }) => {
      const isActive = router.pathname === href;
      return (
        <li key={href} className="nav-item">
          <Link
            href={href}
            className={`nav-link px-3 fw-semibold ${
              isActive
                ? 'text-primary border-bottom border-primary border-2'
                : 'text-secondary'
            }`}
          >
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-expand-lg bg-body px-3 py-2 border-bottom shadow-sm">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold text-primary fs-4">
          🎫 GitTix
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
          <ul className="navbar-nav d-flex align-items-center gap-2">{links}</ul>

          <button
            className="btn btn-sm btn-outline-secondary ms-3"
            onClick={toggleTheme}
            title="Toggle Dark Mode"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
