import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilter from '../components/property/SearchFilter';
const SLIDES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=85',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85',
];

const CITIES = [
  { name:'Mumbai',    img:'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80', count:'2,400+' },
  { name:'Delhi',     img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80', count:'1,800+' },
  { name:'Bangalore', img:'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80', count:'3,200+' },
  { name:'Hyderabad', img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80', count:'1,200+' },
  { name:'Chennai',   img:'https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80', count:'900+' },
  { name:'Pune',      img:'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80', count:'1,400+' },
];

const TYPES = [
  { type:'Apartment', icon:'🏢', label:'Apartments' },
  { type:'Villa',     icon:'🏰', label:'Villas' },
  { type:'House',     icon:'🏠', label:'Houses' },
  { type:'Commercial',icon:'🏪', label:'Commercial' },
  { type:'Land',      icon:'🌿', label:'Land & Plots' },
  { type:'Studio',    icon:'◻️',  label:'Studios' },
];

const STEPS = [
  { icon:'◎', title:'Search & Filter',    desc:'Use smart filters to find properties by city, type, price and more across India.' },
  { icon:'◈', title:'Schedule a Visit',   desc:'Book a property viewing at your convenience directly through the platform.' },
  { icon:'◉', title:'Connect Directly',   desc:'Send inquiries to owners and agents — no middlemen, no hidden fees.' },
  { icon:'⊕', title:'Move In',            desc:'Complete the deal with confidence and get the keys to your new home.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    propertyAPI.getFeatured()
      .then(({ data }) => setFeatured(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (f) => navigate(`/properties?${new URLSearchParams(f).toString()}`);

  return (
    <>
      <style>{componentStyles}</style>
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          {SLIDES.map((s, i) => (
            <div key={i} className={`hero-slide ${i === slideIdx ? 'active' : ''}`}
              style={{ backgroundImage:`url(${s})` }} />
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-line" />
            India's Premier Property Platform
            <span className="hero-eyebrow-line" />
          </div>

          <h1 className="hero-title">
            Find Your<br />
            <em>Dream Property</em>
          </h1>

          <p className="hero-subtitle">
            Discover verified properties across India's finest cities. Buy, rent, or list with complete confidence.
          </p>

          <div className="hero-search">
            <SearchFilter onSearch={handleSearch} compact={true} />
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num">50K+</span><span className="hero-stat-lbl">Properties</span></div>
            <div className="hero-stat-sep" />
            <div className="hero-stat"><span className="hero-stat-num">200+</span><span className="hero-stat-lbl">Cities</span></div>
            <div className="hero-stat-sep" />
            <div className="hero-stat"><span className="hero-stat-num">1,200+</span><span className="hero-stat-lbl">Verified Agents</span></div>
            <div className="hero-stat-sep" />
            <div className="hero-stat"><span className="hero-stat-num">98%</span><span className="hero-stat-lbl">Satisfaction</span></div>
          </div>
        </div>

        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slideIdx ? 'active' : ''}`} onClick={() => setSlideIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── PROPERTY TYPES ── */}
      <section className="section-sm" style={{ background: 'white', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="type-grid">
            {TYPES.map(({ type, icon, label }) => (
              <Link key={type} to={`/properties?propertyType=${type}`} className="type-card">
                <span className="type-icon">{icon}</span>
                <span className="type-label">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <div className="section-eyebrow">Hand-Picked Listings</div>
              <h2 style={{ marginBottom: 0 }}>Featured Properties</h2>
            </div>
            <Link to="/properties?featured=true" className="btn btn-outline btn-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏡</div>
              <h3>No featured properties yet</h3>
              <p>Check back soon or <Link to="/properties">browse all properties</Link></p>
            </div>
          ) : (
            <div className="grid grid-4">
              {featured.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── TOP CITIES ── */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Explore India</div>
            <h2>Properties in Top Cities</h2>
            <p>Discover homes in India's most sought-after urban destinations</p>
          </div>
          <div className="cities-grid">
            {CITIES.map(c => (
              <Link key={c.name} to={`/properties?city=${c.name}`} className="city-card">
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="city-overlay">
                  <div className="city-name">{c.name}</div>
                  <div className="city-count">{c.count} Properties</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow" style={{ color:'var(--gold-light)' }}>
              <span className="hero-eyebrow-line" style={{ background:'var(--gold-light)' }} />
              Simple Process
              <span className="hero-eyebrow-line" style={{ background:'var(--gold-light)' }} />
            </div>
            <h2>How PropFinder Works</h2>
            <p>From search to keys in four easy steps</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <h2>Ready to List Your Property?</h2>
            <p>Reach lakhs of buyers and tenants across India — it's free to start.</p>
          </div>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-white btn-lg">Get Started Free</Link>
            <Link to="/properties" className="btn btn-outline-gold btn-lg" style={{ borderColor:'rgba(255,255,255,0.5)', color:'white' }}>
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};


const componentStyles = `/* ══ HOME PAGE ══ */
.home { overflow-x: hidden; }

/* ── Hero ── */
.hero {
  position: relative; height: 680px;
  display: flex; align-items: center; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }

.hero-slide {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  opacity: 0; transition: opacity 1.2s ease;
}
.hero-slide.active { opacity: 1; }

.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    120deg,
    rgba(9,29,55,0.88) 0%,
    rgba(9,29,55,0.6) 50%,
    rgba(9,29,55,0.2) 100%
  );
}

.hero-content {
  position: relative; z-index: 1;
  color: white; display: flex;
  flex-direction: column; gap: 28px;
  max-width: 640px;
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 11px; font-weight: 600; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--gold);
}
.hero-eyebrow-line { display: block; width: 32px; height: 1px; background: var(--gold); }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(38px, 5.5vw, 68px);
  font-weight: 600; line-height: 1.1;
  color: white; letter-spacing: -0.02em;
}
.hero-title em { color: var(--gold-light); font-style: normal; }

.hero-subtitle {
  font-size: 16px; color: rgba(255,255,255,0.75);
  line-height: 1.7; max-width: 480px;
}

/* Hero search */
.hero-search {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(9,29,55,0.3);
}

/* Hero stats */
.hero-stats { display: flex; align-items: center; gap: 0; flex-wrap: wrap; margin-top: 4px; }
.hero-stat { display: flex; flex-direction: column; gap: 2px; padding: 0 20px; }
.hero-stat:first-child { padding-left: 0; }
.hero-stat-num {
  font-family: var(--font-display);
  font-size: 26px; font-weight: 700; color: white; line-height: 1;
}
.hero-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.8px; }
.hero-stat-sep { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

/* Dots */
.hero-dots {
  position: absolute; bottom: 24px; left: 50%;
  transform: translateX(-50%); display: flex; gap: 6px; z-index: 1;
}
.hero-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.35); border: none; cursor: pointer;
  transition: var(--transition);
}
.hero-dot.active { width: 22px; border-radius: 3px; background: var(--gold); }

/* ── Section headers ── */
.section-header { text-align: center; margin-bottom: 48px; }
.section-header h2 { font-size: clamp(28px, 3.5vw, 42px); margin-bottom: 12px; }
.section-header p  { color: var(--text-light); font-size: 15px; max-width: 520px; margin: 0 auto; }

.section-header-flex {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 36px; gap: 16px; flex-wrap: wrap;
}

/* ── Type cards ── */
.type-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }

.type-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 22px 12px; background: white;
  border: 1.5px solid var(--border-light); border-radius: var(--radius-md);
  transition: var(--transition-slow); cursor: pointer; text-align: center;
}
.type-card:hover {
  border-color: var(--navy); background: var(--primary-light);
  transform: translateY(-3px); box-shadow: var(--shadow-sm);
}
.type-icon  { font-size: 28px; }
.type-label { font-size: 12px; font-weight: 600; color: var(--text-body); letter-spacing: 0.01em; }

/* ── Featured ── */
.featured-section { background: var(--off-white); }

/* ── Cities ── */
.cities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

.city-card {
  position: relative; border-radius: var(--radius-lg);
  overflow: hidden; aspect-ratio: 4/3;
  cursor: pointer; display: block; isolation: isolate;
}
.city-card img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
}
.city-card:hover img { transform: scale(1.06); }

.city-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(9,29,55,0.85) 0%, rgba(9,29,55,0.1) 55%, transparent 100%);
  display: flex; flex-direction: column; justify-content: flex-end; padding: 18px;
}
.city-name   { color: white; font-size: 19px; font-weight: 600; font-family: var(--font-display); }
.city-count  { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 2px; }

/* ── How it works ── */
.how-section { background: var(--navy); }
.how-section .section-header h2 { color: white; }
.how-section .section-header p  { color: rgba(255,255,255,0.6); }

.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.step-card {
  padding: 28px 22px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg); position: relative;
  transition: var(--transition-slow);
}
.step-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-3px); }
.step-num {
  font-family: var(--font-display); font-size: 52px; font-weight: 700;
  color: rgba(255,255,255,0.06); position: absolute; top: 12px; right: 16px; line-height: 1;
}
.step-icon  { font-size: 32px; margin-bottom: 14px; }
.step-card h3 { color: white; font-size: 17px; margin-bottom: 8px; }
.step-card p  { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.65; }

.step-connector { display: none; }

/* ── CTA ── */
.cta-section {
  background: linear-gradient(135deg, var(--gold) 0%, #B8973D 100%);
  padding: 72px 0;
}
.cta-inner {
  display: flex; align-items: center;
  justify-content: space-between; gap: 32px; flex-wrap: wrap;
}
.cta-inner h2 { font-size: clamp(26px, 3vw, 36px); color: white; margin-bottom: 6px; }
.cta-inner p  { color: rgba(255,255,255,0.8); font-size: 15px; }
.cta-btns     { display: flex; gap: 14px; flex-wrap: wrap; }

/* Responsive */
@media (max-width: 1024px) { .type-grid { grid-template-columns: repeat(3, 1fr); } .steps-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  {
  .hero { height: 580px; }
  .type-grid { grid-template-columns: repeat(3, 1fr); }
  .cities-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-stats  { gap: 0; }
  .cta-inner   { flex-direction: column; text-align: center; }
  .section-header-flex { flex-direction: column; align-items: flex-start; }
  .steps-grid { grid-template-columns: 1fr; }
}
`;

export default Home;
