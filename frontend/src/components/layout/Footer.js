import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">Prop<span>Finder</span></div>
          <p>India's most trusted property platform — connecting buyers, sellers and agents since 2024.</p>
          <div className="footer-social">
            {['𝕏','in','f','▶'].map(s => <a key={s} href="#!" className="social-btn">{s}</a>)}
          </div>
        </div>
        <div className="footer-col">
          <h4>Properties</h4>
          <ul>
            <li><Link to="/properties?listingType=Sale">Buy Property</Link></li>
            <li><Link to="/properties?listingType=Rent">Rent Property</Link></li>
            <li><Link to="/properties?propertyType=Commercial">Commercial</Link></li>
            <li><Link to="/properties?propertyType=Villa">Villas</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/dashboard/list-property">List Your Property</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/dashboard/support">Support</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#!">Privacy Policy</a></li>
            <li><a href="#!">Terms of Service</a></li>
            <li><a href="#!">Cookie Policy</a></li>
            <li><a href="mailto:hello@propfinder.in">hello@propfinder.in</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PropFinder. All rights reserved.</span>
        <div className="footer-bottom-links">
          <a href="#!">Privacy</a>
          <a href="#!">Terms</a>
          <a href="#!">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
