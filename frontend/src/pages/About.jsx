import React from 'react';
import { Link } from 'react-router-dom';
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
  <>
    <style>{componentStyles}</style>

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
  </>
);


const componentStyles = `.about-page { overflow-x: hidden; }

/* Hero */
.about-hero {
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%);
  padding: 96px 0 80px; position: relative; overflow: hidden;
}
.about-hero::before {
  content: ''; position: absolute; top: -40px; right: -80px;
  width: 500px; height: 500px; border-radius: 50%;
  background: rgba(201,168,76,0.06); pointer-events: none;
}
.about-hero-content { max-width: 640px; }
.about-hero-content .section-eyebrow { margin-bottom: 12px; }
.about-hero-content h1 { font-size: clamp(34px,4.5vw,54px); color: white; margin-bottom: 20px; line-height: 1.15; }
.about-hero-content p  { font-size: 16px; color: rgba(255,255,255,0.65); line-height: 1.75; margin-bottom: 32px; max-width: 520px; }
.about-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }

/* Stats */
.about-stats-section { background: var(--navy); padding: 0; }
.about-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); }
.about-stat-card { padding: 36px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.08); }
.about-stat-card:last-child { border-right: none; }
.about-stat-value { font-family: var(--font-display); font-size: 40px; font-weight: 700; color: var(--gold); line-height: 1; margin-bottom: 8px; }
.about-stat-label { font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; }

/* Mission */
.about-mission { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-mission-img { border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-xl); aspect-ratio: 4/3; }
.about-mission-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.about-mission-text h2 { font-size: 34px; margin-bottom: 16px; }
.about-mission-text p  { color: var(--text-body); font-size: 15px; line-height: 1.75; margin-bottom: 14px; }
.about-mission-highlights { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.mh-item { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--text-body); }
.mh-check { width: 20px; height: 20px; border-radius: 50%; background: var(--gold); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }

/* Values */
.value-card { background: white; border-radius: var(--radius-lg); padding: 28px 24px; border: 1px solid var(--border-light); box-shadow: var(--shadow-xs); transition: var(--transition-slow); }
.value-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: var(--gold-light); }
.value-icon { font-size: 28px; margin-bottom: 14px; color: var(--gold); }
.value-card h3 { font-size: 18px; margin-bottom: 8px; }
.value-card p  { font-size: 13px; color: var(--text-light); line-height: 1.65; }

/* Team */
.team-card { border-radius: var(--radius-lg); overflow: hidden; background: white; border: 1px solid var(--border-light); box-shadow: var(--shadow-xs); transition: var(--transition-slow); }
.team-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.team-img-wrap { aspect-ratio: 1; overflow: hidden; }
.team-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s var(--ease); }
.team-card:hover .team-img-wrap img { transform: scale(1.05); }
.team-info { padding: 16px 18px; }
.team-info h3 { font-size: 16px; margin-bottom: 3px; }
.team-info p  { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

/* CTA */
.about-cta { background: linear-gradient(135deg, var(--gold) 0%, #B8973D 100%); padding: 80px 0; text-align: center; }
.about-cta h2 { font-size: clamp(26px,3vw,38px); color: white; margin-bottom: 12px; }
.about-cta p  { color: rgba(255,255,255,0.75); font-size: 15px; margin-bottom: 32px; }
.about-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 1024px) { .about-stats-grid { grid-template-columns: repeat(2,1fr); } .about-stat-card { border-bottom: 1px solid rgba(255,255,255,0.08); } }
@media (max-width: 768px)  { .about-mission { grid-template-columns: 1fr; gap: 32px; } .about-hero { padding: 60px 0; } }
`;

export default About;
