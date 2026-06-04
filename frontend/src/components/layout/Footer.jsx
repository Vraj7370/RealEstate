import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => (
  <>
    <style>{componentStyles}</style>

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
  </>
);


const componentStyles = `.footer { background: var(--navy-dark); padding: 64px 0 0; margin-top: 0; }

.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }

.footer-brand .footer-logo { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: white; margin-bottom: 12px; }
.footer-brand .footer-logo span { color: var(--gold); }
.footer-brand p { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 260px; }

.footer-social { display: flex; gap: 8px; margin-top: 18px; }
.social-btn {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; color: rgba(255,255,255,0.5);
  transition: var(--transition); cursor: pointer;
}
.social-btn:hover { background: var(--gold); border-color: var(--gold); color: white; transform: translateY(-2px); }

.footer-col h4 {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--gold); margin-bottom: 16px;
  font-family: var(--font-body);
}
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.footer-col ul li a {
  font-size: 13px; color: rgba(255,255,255,0.5); transition: var(--transition);
}
.footer-col ul li a:hover { color: white; padding-left: 4px; }

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 20px 0; display: flex;
  align-items: center; justify-content: space-between;
  font-size: 12px; color: rgba(255,255,255,0.3);
}
.footer-bottom-links { display: flex; gap: 20px; }
.footer-bottom-links a { color: rgba(255,255,255,0.3); transition: var(--transition); }
.footer-bottom-links a:hover { color: rgba(255,255,255,0.7); }

@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .footer-brand { grid-column: 1/-1; }
  .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
}
`;

export default Footer;
