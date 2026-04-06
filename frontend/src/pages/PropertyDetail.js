import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyAPI, inquiryAPI, visitAPI, favoriteAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './PropertyDetail.css';

const PH = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

// ── EMI Calculator ─────────────────────────────────────────
const EMICalculator = ({ price }) => {
  const [loan,      setLoan]      = useState(Math.round(price * 0.8 / 100000) * 100000);
  const [rate,      setRate]      = useState(8.5);
  const [tenure,    setTenure]    = useState(20);
  const [showCalc,  setShowCalc]  = useState(false);

  const emi = useCallback(() => {
    const P = loan;
    const r = rate / 12 / 100;
    const n = tenure * 12;
    if (r === 0) return P / n;
    return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [loan, rate, tenure]);

  const monthlyEMI   = emi();
  const totalPayment = monthlyEMI * tenure * 12;
  const totalInt     = totalPayment - loan;

  if (!showCalc) return (
    <button className="emi-toggle-btn" onClick={() => setShowCalc(true)}>
      ≡  Calculate EMI
    </button>
  );

  return (
    <div className="emi-calc">
      <div className="emi-header">
        <h3>EMI Calculator</h3>
        <button className="emi-close" onClick={() => setShowCalc(false)}>✕</button>
      </div>
      <div className="emi-body">
        <div className="emi-field">
          <div className="emi-field-header">
            <label>Loan Amount</label>
            <span>{formatPrice(loan)}</span>
          </div>
          <input type="range" min={500000} max={price * 1.2} step={100000}
            value={loan} onChange={e => setLoan(Number(e.target.value))} className="emi-range" />
          <div className="emi-range-limits"><span>₹5 L</span><span>{formatPrice(price * 1.2)}</span></div>
        </div>
        <div className="emi-field">
          <div className="emi-field-header">
            <label>Interest Rate (p.a.)</label>
            <span>{rate}%</span>
          </div>
          <input type="range" min={5} max={20} step={0.1}
            value={rate} onChange={e => setRate(Number(e.target.value))} className="emi-range" />
          <div className="emi-range-limits"><span>5%</span><span>20%</span></div>
        </div>
        <div className="emi-field">
          <div className="emi-field-header">
            <label>Tenure</label>
            <span>{tenure} years</span>
          </div>
          <input type="range" min={1} max={30} step={1}
            value={tenure} onChange={e => setTenure(Number(e.target.value))} className="emi-range" />
          <div className="emi-range-limits"><span>1 yr</span><span>30 yrs</span></div>
        </div>

        <div className="emi-result">
          <div className="emi-monthly">
            <span className="emi-lbl">Monthly EMI</span>
            <span className="emi-val">{formatPrice(monthlyEMI)}</span>
          </div>
          <div className="emi-breakdown">
            <div><span>Principal</span><span>{formatPrice(loan)}</span></div>
            <div><span>Total Interest</span><span>{formatPrice(totalInt)}</span></div>
            <div className="emi-total"><span>Total Amount</span><span>{formatPrice(totalPayment)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────
const PropertyDetail = () => {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [property,     setProperty]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeImg,    setActiveImg]    = useState(0);
  const [isFav,        setIsFav]        = useState(false);
  const [isOwnProperty,setIsOwnProperty]= useState(false);
  const [showInquiry,  setShowInquiry]  = useState(false);
  const [showVisit,    setShowVisit]    = useState(false);
  const [showReview,   setShowReview]   = useState(false);
  const [inquiryForm,  setInquiryForm]  = useState({ message: '', contactPhone: '', contactEmail: '' });
  const [visitForm,    setVisitForm]    = useState({ visitDate: '', visitTime: '', notes: '' });
  const [reviewForm,   setReviewForm]   = useState({ rating: 5, comment: '' });
  const [submitting,   setSubmitting]   = useState(false);
  const [activeTab,    setActiveTab]    = useState('description');

  // Track recently viewed in localStorage
  useEffect(() => {
    if (!id) return;
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [id, ...viewed.filter(v => v !== id)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [id]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await propertyAPI.getOne(id);
        setProperty(data.data);
        setIsFav(data.data.isFavorited);
        setIsOwnProperty(data.data.isOwner || false);
        if (user) {
          setInquiryForm(f => ({
            ...f,
            contactPhone: user.phone || '',
            contactEmail: user.email || '',
          }));
        }
      } catch {
        toast.error('Property not found');
        navigate('/properties');
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id, user, navigate]);

  const handleFavorite = async () => {
    if (!user) { toast.error('Please sign in to save properties'); return; }
    try {
      const { data } = await favoriteAPI.toggle(id);
      setIsFav(data.isFavorited);
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await inquiryAPI.create(id, inquiryForm);
      toast.success('Inquiry sent! The owner will contact you soon.');
      setShowInquiry(false);
      setInquiryForm(f => ({ ...f, message: '' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send inquiry'); }
    setSubmitting(false);
  };

  const handleVisit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await visitAPI.schedule(id, visitForm);
      toast.success('Visit scheduled! The owner will confirm soon.');
      setShowVisit(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule visit'); }
    setSubmitting(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const { data } = await propertyAPI.addReview(id, reviewForm);
      setProperty(p => ({
        ...p,
        reviews: [data.data, ...(p.reviews || [])],
        avgRating: ((p.avgRating || 0) * (p.reviews?.length || 0) + reviewForm.rating) / ((p.reviews?.length || 0) + 1),
      }));
      toast.success('Review submitted!');
      setShowReview(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add review'); }
    setSubmitting(false);
  };

  // Share property
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: property.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!property) return null;

  const images  = property.images?.length ? property.images : [PH];
  const loc     = property.location;
  const owner   = property.ownerId;
  const agent   = property.agentId;
  const isForSale = property.listingType === 'Sale';

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'amenities',   label: 'Amenities' },
    { id: 'reviews',     label: `Reviews (${property.reviews?.length || 0})` },
    ...(isForSale ? [{ id: 'emi', label: 'EMI Calculator' }] : []),
  ];

  return (
    <div className="property-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/properties">Properties</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/properties?city=${loc?.city}`}>{loc?.city}</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{property.title}</span>
        </div>

        <div className="detail-layout">
          {/* ── Main Column ── */}
          <div className="detail-main">
            {/* Gallery */}
            <div className="gallery-main">
              <img
                key={activeImg}
                src={images[activeImg]}
                alt={property.title}
                onError={e => { e.target.src = PH; }}
              />
              <div className="gallery-overlay-top">
                <div className="gallery-badges">
                  <span className={`badge badge-${property.listingType?.toLowerCase()}`}>{property.listingType}</span>
                  <span className={`badge badge-${property.status?.toLowerCase()}`}>{property.status}</span>
                  {property.featured && <span className="badge badge-featured">★ Featured</span>}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="gallery-fav" onClick={handleShare} title="Share property">
                    ⬆
                  </button>
                  <button
                    className={`gallery-fav ${isFav ? 'active' : ''}`}
                    onClick={handleFavorite} title={isFav ? 'Remove from saved' : 'Save property'}
                  >
                    {isFav ? '♥' : '♡'}
                  </button>
                </div>
              </div>
              <div className="gallery-counter">{activeImg + 1} / {images.length}</div>

              {/* Gallery nav arrows */}
              {images.length > 1 && (
                <>
                  <button className="gallery-arrow gallery-arrow-left"
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>‹</button>
                  <button className="gallery-arrow gallery-arrow-right"
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}>›</button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <img
                    key={i} src={img} alt=""
                    className={activeImg === i ? 'active' : ''}
                    onClick={() => setActiveImg(i)}
                    onError={e => { e.target.src = PH; }}
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            {/* Price + title card */}
            <div className="detail-card">
              <div className="detail-header">
                <div>
                  <h1 className="detail-title">{property.title}</h1>
                  <p className="detail-location">
                    ⊙ {loc?.address && `${loc.address}, `}{loc?.city}, {loc?.state}
                    {loc?.pincode && ` — ${loc.pincode}`}
                  </p>
                </div>
                <div className="detail-price-block">
                  <div className="detail-price">{formatPrice(property.price)}</div>
                  {!isForSale && <p className="price-mo">per month</p>}
                  {property.area > 0 && (
                    <p className="price-sqft">₹{Math.round(property.price / property.area).toLocaleString()}/sq.ft</p>
                  )}
                </div>
              </div>

              {/* Key features */}
              <div className="key-features">
                {property.bedrooms > 0 && (
                  <div className="kf-item">
                    <span className="kf-icon">⊟</span>
                    <span className="kf-val">{property.bedrooms}</span>
                    <span className="kf-lbl">Bedrooms</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="kf-item">
                    <span className="kf-icon">◎</span>
                    <span className="kf-val">{property.bathrooms}</span>
                    <span className="kf-lbl">Bathrooms</span>
                  </div>
                )}
                <div className="kf-item">
                  <span className="kf-icon">◻</span>
                  <span className="kf-val">{property.area?.toLocaleString()}</span>
                  <span className="kf-lbl">Sq. Ft</span>
                </div>
                <div className="kf-item">
                  <span className="kf-icon">≡</span>
                  <span className="kf-val">{property.furnishing?.split('-')[0]}</span>
                  <span className="kf-lbl">Furnishing</span>
                </div>
                <div className="kf-item">
                  <span className="kf-icon">⊡</span>
                  <span className="kf-val">{property.parking ? 'Yes' : 'No'}</span>
                  <span className="kf-lbl">Parking</span>
                </div>
                <div className="kf-item">
                  <span className="kf-icon">⊕</span>
                  <span className="kf-val">{property.propertyType}</span>
                  <span className="kf-lbl">Type</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`detail-tab ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="detail-card">
              {activeTab === 'description' && (
                <>
                  <h2>About this Property</h2>
                  <p className="detail-desc">{property.description}</p>
                </>
              )}

              {activeTab === 'amenities' && (
                <>
                  <h2>Amenities & Features</h2>
                  {property.amenities?.length > 0 ? (
                    <div className="amenities-grid">
                      {property.amenities.map(a => (
                        <div key={a} className="amenity-item">
                          <span className="amenity-check">✓</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No amenities specified for this property.</p>
                  )}
                </>
              )}

              {activeTab === 'reviews' && (
                <>
                  <div className="reviews-header">
                    <h2>Reviews & Ratings</h2>
                    <div className="avg-rating">
                      <span className="rating-num">{(property.avgRating || 0).toFixed(1)}</span>
                      <div>
                        <div className="stars">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`star ${s <= Math.round(property.avgRating || 0) ? '' : 'empty'}`}>★</span>
                          ))}
                        </div>
                        <span className="rating-cnt">{property.reviews?.length || 0} reviews</span>
                      </div>
                    </div>
                    {user && !isOwnProperty && (
                      <button className="btn btn-outline btn-sm" onClick={() => setShowReview(true)}>
                        + Write Review
                      </button>
                    )}
                  </div>

                  {(property.reviews?.length || 0) === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign:'center', padding: '24px 0' }}>
                      No reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    <div className="reviews-list">
                      {property.reviews?.map(r => (
                        <div key={r._id} className="review-item">
                          <div className="review-user">
                            <div className="reviewer-avatar">
                              {r.userId?.profilePic
                                ? <img src={r.userId.profilePic} alt="" />
                                : r.userId?.firstName?.[0]
                              }
                            </div>
                            <div>
                              <p className="reviewer-name">{r.userId?.firstName} {r.userId?.lastName}</p>
                              <div className="stars">
                                {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= r.rating ? '' : 'empty'}`}>★</span>)}
                              </div>
                            </div>
                            <span className="review-date">{formatDate(r.createdAt)}</span>
                          </div>
                          <p className="review-comment">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'emi' && isForSale && (
                <>
                  <h2>EMI Calculator</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Estimate your monthly home loan EMI based on loan amount, interest rate and tenure.
                  </p>
                  <EMICalculator price={property.price} />
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="detail-sidebar">
            {/* Listed By */}
            {(owner || agent) && (
              <div className="detail-card owner-card">
                <h3>Listed By</h3>
                <div className="owner-profile">
                  <div className="owner-big-avatar" style={{ background: owner?.profilePic ? 'transparent' : 'var(--navy)' }}>
                    {owner?.profilePic ? <img src={owner.profilePic} alt="" /> : owner?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="owner-fullname">{owner?.firstName} {owner?.lastName}</p>
                    <span className="owner-tag">{agent ? 'Via Agent' : 'Property Owner'}</span>
                  </div>
                </div>
                {agent && (
                  <div className="agent-row">
                    <span>Agent:</span>
                    <strong>{agent.firstName} {agent.lastName}</strong>
                  </div>
                )}
                <div className="owner-contacts">
                  {owner?.phone && (
                    <a href={`tel:${owner.phone}`} className="contact-btn phone-btn">
                      ☎ {owner.phone}
                    </a>
                  )}
                  {owner?.email && (
                    <a href={`mailto:${owner.email}`} className="contact-btn email-btn">
                      ✉ Email Owner
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="sidebar-actions">
              {!isOwnProperty && property.status === 'Available' ? (
                <>
                  <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => user ? setShowInquiry(true) : navigate('/login')}
                  >
                    ◈ Send Inquiry
                  </button>
                  <button
                    className="btn btn-outline btn-block"
                    style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                    onClick={() => user ? setShowVisit(true) : navigate('/login')}
                  >
                    ⊡ Schedule a Visit
                  </button>
                </>
              ) : property.status !== 'Available' ? (
                <div className="status-notice">
                  <span>◎</span>
                  <p>This property is <strong>{property.status}</strong> and not accepting inquiries.</p>
                </div>
              ) : null}

              {!isOwnProperty && (
                <button
                  className={`btn btn-block ${isFav ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ border: '1.5px solid', borderColor: isFav ? 'var(--gold)' : 'var(--border)' }}
                  onClick={handleFavorite}
                >
                  {isFav ? '♥ Saved' : '♡ Save Property'}
                </button>
              )}

              {isOwnProperty && (
                <div className="owner-notice">
                  <span>⊟</span>
                  <p>This is your listing</p>
                  <Link to="/dashboard/my-properties" className="btn btn-outline btn-sm">
                    Manage Listings
                  </Link>
                </div>
              )}

              <button className="btn btn-ghost btn-block" onClick={handleShare} style={{ border: '1.5px solid var(--border)' }}>
                ⬆ Share Property
              </button>

              {/* EMI quick calc for sale properties */}
              {isForSale && (
                <div className="sidebar-emi">
                  <EMICalculator price={property.price} />
                </div>
              )}
            </div>

            {/* Property Overview */}
            <div className="detail-card overview-card">
              <h3>Property Overview</h3>
              <div className="overview-list">
                <div className="overview-row"><span>Property ID</span><span>#{property._id?.slice(-8).toUpperCase()}</span></div>
                <div className="overview-row"><span>Type</span><span>{property.propertyType}</span></div>
                <div className="overview-row"><span>Listing</span><span>{property.listingType}</span></div>
                <div className="overview-row"><span>Status</span>
                  <span className={`badge badge-${property.status?.toLowerCase()}`}>{property.status}</span>
                </div>
                <div className="overview-row"><span>Listed On</span><span>{formatDate(property.createdAt)}</span></div>
                <div className="overview-row"><span>Total Views</span><span>◎ {property.views || 0}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inquiry Modal ── */}
      {showInquiry && (
        <div className="modal-overlay" onClick={() => setShowInquiry(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Inquiry</h2>
              <button className="modal-close" onClick={() => setShowInquiry(false)}>✕</button>
            </div>
            <form onSubmit={handleInquiry}>
              <div className="modal-body">
                <p className="modal-property-title">{property.title}</p>
                <div className="form-group">
                  <label className="form-label">Your Message *</label>
                  <textarea className="form-control" rows={4} required
                    placeholder="I am interested in this property. Please share more details..."
                    value={inquiryForm.message}
                    onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={inquiryForm.contactPhone}
                      onChange={e => setInquiryForm(f => ({ ...f, contactPhone: e.target.value }))}
                      placeholder="Your phone number" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={inquiryForm.contactEmail}
                      onChange={e => setInquiryForm(f => ({ ...f, contactEmail: e.target.value }))}
                      placeholder="Your email" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowInquiry(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Visit Modal ── */}
      {showVisit && (
        <div className="modal-overlay" onClick={() => setShowVisit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule a Visit</h2>
              <button className="modal-close" onClick={() => setShowVisit(false)}>✕</button>
            </div>
            <form onSubmit={handleVisit}>
              <div className="modal-body">
                <p className="modal-property-title">{property.title}</p>
                <div className="form-group">
                  <label className="form-label">Visit Date *</label>
                  <input type="date" className="form-control" required
                    min={new Date().toISOString().split('T')[0]}
                    value={visitForm.visitDate}
                    onChange={e => setVisitForm(f => ({ ...f, visitDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time *</label>
                  <select className="form-control" required value={visitForm.visitTime}
                    onChange={e => setVisitForm(f => ({ ...f, visitTime: e.target.value }))}>
                    <option value="">Select a time slot</option>
                    {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'].map(t =>
                      <option key={t} value={t}>{t}</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea className="form-control" rows={2}
                    placeholder="Any special requirements or questions..."
                    value={visitForm.notes}
                    onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowVisit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling…' : 'Schedule Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button className="modal-close" onClick={() => setShowReview(false)}>✕</button>
            </div>
            <form onSubmit={handleReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <div className="rating-selector">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button"
                        className={`rating-star ${s <= reviewForm.rating ? 'active' : ''}`}
                        onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>★</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review *</label>
                  <textarea className="form-control" rows={4} required
                    placeholder="Share your experience with this property..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowReview(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
