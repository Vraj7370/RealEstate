import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilter from '../components/property/SearchFilter';
import './Home.css';

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
  );
};

export default Home;
