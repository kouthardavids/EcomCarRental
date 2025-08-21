import React, { useEffect, useState } from "react";
import "./nav.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import logo from '../assets/logo__1_-removebg-preview.png';
import { useAuth } from '../api/authContext';
import { clearAccessToken, getCurrentUser } from '../api/authToken';

const Navbar = ({ transparent }) => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout: authLogout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    checkAuthStatus();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.classList.remove('nav-mobile-open');
  }, [location]);

  // Handle window resize to close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
        document.body.classList.remove('nav-mobile-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAuthStatus = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      setUser(null);
      navigate('/');
      setMobileMenuOpen(false);
      document.body.classList.remove('nav-mobile-open');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    if (newState) {
      document.body.classList.add('nav-mobile-open');
    } else {
      document.body.classList.remove('nav-mobile-open');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.classList.remove('nav-mobile-open');
  };

  const isTransparent = transparent && location.pathname === '/' && !scrolled;

  return (
    <>
      {/* Overlay for mobile menu */}
      <div 
        className={`nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      <header className={`${isTransparent ? 'transparent' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="ChauffeurLux Logo" />
            <span>ChauffeurLux</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/catalogue">Catalogue</Link></li>
            <li><Link to="/rentalcart">Rental Cart</Link></li>
            <li><HashLink smooth to="/#contact">Contact</HashLink></li>

            {/* Conditional rendering based on authentication */}
            {user ? (
              <li>
                <a href="#" onClick={handleLogout} className="nav-link">Logout</a>
              </li>
            ) : (
              <>
                <li><Link to="/login" className="cta">Login</Link></li>
                <li><Link to="/register" className="cta">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* Hamburger Menu Button */}
        <div 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`nav-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/about" onClick={closeMobileMenu}>About</Link></li>
          <li><Link to="/catalogue" onClick={closeMobileMenu}>Catalogue</Link></li>
          <li><Link to="/rentalcart" onClick={closeMobileMenu}>Rental Cart</Link></li>
          <li><HashLink smooth to="/#contact" onClick={closeMobileMenu}>Contact</HashLink></li>

          {/* Conditional rendering based on authentication */}
          {user ? (
            <li>
              <a href="#" onClick={handleLogout} className="nav-link">Logout</a>
            </li>
          ) : (
            <li>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                <Link to="/login" className="cta" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="cta" onClick={closeMobileMenu}>Sign Up</Link>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;