import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import videoplayback from '../assets/lv_0_20250814160706 (1).mp4';
import Navbar from "../components/Navbar";
import "./home.css";

const Home = () => {
  return (
    <>
      <Navbar transparent />

      <section className="video-section" id='home'>
        <video autoPlay muted loop playsInline>
          <source src={videoplayback} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      <section className="services" id='services'>
        <div className="container">
          <h2>OUR SERVICES</h2>
          <h1>Tailored Luxury Transportation</h1>

          <div className="service-grid">
            <div className="service-card">
              <img src="https://i.pinimg.com/736x/8a/d8/77/8ad8772a7417d96cc5deaf3c380080b2.jpg"></img>
              <h3>Corporate Travel</h3>

              <p>Impeccable service for executives with strict punctuality and discretion.</p>
            </div>

            <div className="service-card">
              <img src="https://i.pinimg.com/1200x/0e/94/2e/0e942e97e4cba23451d7edc2abe2e3b4.jpg"></img>
              <h3>Special Events</h3>
              <p>Weddings, galas, and celebrations with our luxury fleet.</p>
            </div>

            <div className="service-card">
              <img src="https://i.pinimg.com/1200x/84/47/c5/8447c5d454768c42b7fd14a8a6cff345.jpg"></img>
              <h3>Airport Transfers</h3>
              <p>Seamless airport transportation with flight monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready for Your Luxury Experience?</h2>
          <p>Check out our catalogue and book a ride today!</p>
          <Link to="/catalogue" className="btn">Catalogue</Link>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-about">
              <h3>ChauffeurLux</h3>
              <p>Providing exceptional chauffeur services. Luxury, discretion, and professionalism at every turn.</p>
            </div>

            <div className="footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><HashLink smooth to="/#home">Home</HashLink></li>
                <li><HashLink smooth to="/#services">Services</HashLink></li>
                <li><Link to="/catalogue">Catalogue</Link></li>
                <li><HashLink smooth to="/rentalcart">Cart</HashLink></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </div>

            <div className="footer-contact" id="contact">
              <h3>Contact</h3>
              <ul>
                <li>+27 21 987 6543</li>
                <li>+27 83 459 7890</li>
                <li>info@chauffeurlux.com</li>
                <li>25 Bree Street, Cape Town</li>
              </ul>
            </div>
          </div>

          <div className="copyright">
            <p>&copy; 2025 ChauffeurLux. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;