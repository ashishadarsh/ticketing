import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = ({ currentUser }) => {
  const router = useRouter();

  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' }
  ]
    .filter(Boolean)
    .map(({ label, href }) => {
      const isActive = router.pathname === href;

      return (
        <li key={href} className="nav-item">
          <Link
            href={href}
            className={`nav-link px-3 ${isActive ? 'active fw-semibold text-primary' : ''}`}
          >
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold text-primary fs-4">
          GitTix
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
          <ul className="navbar-nav d-flex align-items-center">{links}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
