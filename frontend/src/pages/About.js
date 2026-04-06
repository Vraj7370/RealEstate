import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import VrajImg from '../assets/team/vraj.jpg';

const STATS = [
  { value: '50,000+', label: 'Properties Listed' },
  { value: '1,200+',  label: 'Verified Agents' },
  { value: '200+',    label: 'Cities Covered' },
  { value: '98%',     label: 'Client Satisfaction' },
];

const TEAM = [
  { name: 'Vraj Patel', role: 'Chief Executive Officer', img: VrajImg },
];

const VALUES = [
  { icon: '◎', title: 'Transparency',  desc: 'Every listing is verified. Every price is honest. No hidden charges, ever.' },
  { icon: '◈', title: 'Trust',         desc: 'We connect real people — owners, buyers and agents — with integrity at the core.' },
  { icon: '◉', title: 'Technology',    desc: 'Our platform is built to make property search simple, smart and stress-free.' },
  { icon: '⊕', title: 'Community',     desc: 'We believe everyone deserves a home. We\'re here to make that happen.' },
];

const About = () => (
  <div className="about-page">
    {/* Hero */}
    <section className="about-hero">
      <div className="container">
        <div className="about-hero-content">
          <div className="section-eyebrow">Our Story</div>
          <h1>India's Most Trusted<br />Property Platform</h1>
          <p>
            Founded in 2024, PropFinder was built with a single mission — to make finding a home 
            in India transparent, simple and reliable. We believe the property search process 
            should be as exciting as moving into your new home.
          </p>
          <div className="about-hero-btns">
            <Link to="/properties" className="btn btn-primary btn-lg">Browse Properties</Link>
            <Link to="/register"   className="btn btn-outline btn-lg">Join PropFinder</Link>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="about-stats-section">
      <div className="container">
        <div className="about-stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="about-stat-card">
              <div className="about-stat-value">{s.value}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="section" style={{ background: 'white' }}>
      <div className="container">
        <div className="about-mission">
          <div className="about-mission-img">
            <img
              src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=700&q=80"
              alt="Our office"
            />
          </div>
          <div className="about-mission-text">
            <div className="section-eyebrow">Our Mission</div>
            <h2>Making Real Estate Simple for Every Indian</h2>
            <p>
              We started PropFinder because we experienced first-hand how stressful 
              the property search process can be — unclear pricing, unverified listings, 
              and too many middlemen.
            </p>
            <p>
              Today, PropFinder connects lakhs of buyers, sellers, owners and agents 
              across 200+ Indian cities. Every property on our platform is verified. 
              Every agent is certified. Every transaction is transparent.
            </p>
            <div className="about-mission-highlights">
              {['Verified listings only', 'Zero brokerage on select properties', 'Direct owner connect', 'Dedicated support team'].map(h => (
                <div key={h} className="mh-item">
                  <span className="mh-check">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">What We Stand For</div>
          <h2>Our Core Values</h2>
          <p>Everything we build and every decision we make is guided by these principles</p>
        </div>
        <div className="grid grid-4">
          {VALUES.map(v => (
            <div key={v.title} className="value-card">
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="section" style={{ background: 'white' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">The People Behind PropFinder</div>
          <h2>Meet Our Team</h2>
        </div>
        <div className="grid grid-4">
          {TEAM.map(m => (
            <div key={m.name} className="team-card">
              <div className="team-img-wrap">
                <img src={m.img} alt={m.name} onError={e => { e.target.src='https://via.placeholder.com/200x200?text=?'; }} />
              </div>
              <div className="team-info">
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="about-cta">
      <div className="container">
        <h2>Ready to Find Your Dream Property?</h2>
        <p>Join over 5 lakh Indians who trust PropFinder for their property needs.</p>
        <div className="about-cta-btns">
          <Link to="/properties" className="btn btn-white btn-lg">Search Properties</Link>
          <Link to="/dashboard/list-property" className="btn btn-outline-gold btn-lg" style={{ borderColor:'rgba(255,255,255,0.4)', color:'white' }}>
            List Your Property
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
