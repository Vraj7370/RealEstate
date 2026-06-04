import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyAPI, inquiryAPI, visitAPI, favoriteAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
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
    <>
      <style>{componentStyles}</style>
    <button className="emi-toggle-btn" onClick={() => setShowCalc(true)}>
      ≡  Calculate EMI
    </button>
    </>
  );

  return (
    <>
      <style>{componentStyles}</style>
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
    </>
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
    <>
      <style>{componentStyles}</style>
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
    </>
  );
};


const componentStyles = `/* ══ PROPERTY DETAIL PAGE ══ */
.property-detail { padding: 28px 0 72px; }

.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-muted);
  margin-bottom: 24px;
}
.breadcrumb a { color: var(--navy); }
.breadcrumb a:hover { text-decoration: underline; }
.breadcrumb-sep { color: var(--border); }

.detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
.detail-main   { display: flex; flex-direction: column; gap: 16px; }

/* ── Gallery ── */
.gallery-main {
  position: relative; border-radius: var(--radius-lg);
  overflow: hidden; aspect-ratio: 4/3;
  background: var(--bg); isolation: isolate;
}
.gallery-main img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
}

.gallery-overlay-top {
  position: absolute; top: 14px; left: 14px; right: 14px;
  display: flex; justify-content: space-between; align-items: flex-start;
  z-index: 2; pointer-events: none;
}
.gallery-overlay-top .gallery-badges { pointer-events: auto; display: flex; gap: 6px; }

.gallery-fav {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.92); border: none;
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  transition: var(--transition); pointer-events: auto;
}
.gallery-fav:hover { transform: scale(1.1); background: white; }
.gallery-fav.active { background: #FEF2F2; }

.gallery-counter {
  position: absolute; bottom: 12px; right: 12px; z-index: 2;
  background: rgba(9,29,55,0.7); color: white;
  padding: 4px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
}

/* Thumbnails */
.gallery-thumbs {
  display: flex; gap: 8px; margin-top: 10px;
  overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;
}
.gallery-thumbs img {
  width: 76px; height: 54px; object-fit: cover;
  border-radius: 8px; cursor: pointer; flex-shrink: 0;
  opacity: 0.55; border: 2px solid transparent;
  transition: opacity 0.2s, border-color 0.2s;
}
.gallery-thumbs img.active,
.gallery-thumbs img:hover { opacity: 1; border-color: var(--navy); }

/* ── Info cards ── */
.detail-card {
  background: white; border-radius: var(--radius-lg);
  padding: 24px; border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xs);
}

.detail-header {
  display: flex; justify-content: space-between;
  gap: 20px; margin-bottom: 20px; flex-wrap: wrap;
}
.detail-title    { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.detail-location { font-size: 13px; color: var(--text-light); display: flex; align-items: center; gap: 4px; }

.detail-price-block { text-align: right; flex-shrink: 0; }
.detail-price   { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--navy); line-height: 1; }
.price-mo       { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.price-sqft     { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* Key features grid */
.key-features {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 0; border-top: 1px solid var(--border-light); padding-top: 16px;
}
.kf-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; text-align: center;
  padding: 10px 4px;
}
.kf-item:not(:last-child) { border-right: 1px solid var(--border-light); }
.kf-icon { font-size: 20px; }
.kf-val  { font-weight: 700; font-size: 14px; color: var(--text); }
.kf-lbl  { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* Section titles */
.detail-card h2 {
  font-size: 17px; font-weight: 600; margin-bottom: 14px;
  padding-bottom: 12px; border-bottom: 1px solid var(--border-light);
  display: flex; align-items: center; gap: 8px;
}
.detail-card h2::before { content: ''; display: block; width: 3px; height: 16px; background: var(--gold); border-radius: 2px; }

.detail-desc { font-size: 14px; color: var(--text-body); line-height: 1.75; }

/* Amenities */
.amenities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.amenity-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: var(--bg);
  border-radius: var(--radius); font-size: 13px; color: var(--text-body);
  border: 1px solid var(--border-light);
}
.amenity-check { color: var(--success); font-weight: 700; font-size: 12px; }

/* Reviews */
.reviews-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
  padding-bottom: 14px; border-bottom: 1px solid var(--border-light);
}
.reviews-header h2 { border: none; padding: 0; margin: 0; }

.avg-rating { display: flex; align-items: center; gap: 8px; }
.rating-num { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--navy); line-height: 1; }
.rating-cnt { font-size: 12px; color: var(--text-muted); }

.reviews-list { display: flex; flex-direction: column; gap: 12px; }
.review-item {
  padding: 14px; background: var(--bg);
  border-radius: var(--radius); border: 1px solid var(--border-light);
}
.review-user { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reviewer-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--navy); color: white;
  font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.reviewer-avatar img { width: 100%; height: 100%; object-fit: cover; }
.reviewer-name { font-size: 13px; font-weight: 600; }
.review-date   { margin-left: auto; font-size: 11px; color: var(--text-muted); }
.review-comment { font-size: 13px; color: var(--text-body); line-height: 1.6; }

.rating-selector { display: flex; gap: 6px; }
.rating-star { font-size: 26px; background: none; border: none; cursor: pointer; color: var(--border); transition: var(--transition); }
.rating-star.active { color: var(--gold); }

/* ── Sidebar ── */
.detail-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }

/* Owner card */
.owner-card { padding: 20px; }
.owner-card h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-family: var(--font-body); font-weight: 600; margin-bottom: 14px; }

.owner-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.owner-big-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--navy); color: white;
  font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
}
.owner-big-avatar img { width: 100%; height: 100%; object-fit: cover; }
.owner-fullname { font-size: 15px; font-weight: 600; color: var(--text); }
.owner-tag {
  display: inline-block; margin-top: 3px;
  padding: 2px 8px; background: var(--primary-light);
  color: var(--navy); border-radius: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
}

.owner-contacts { display: flex; flex-direction: column; gap: 8px; }
.contact-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px; border-radius: var(--radius);
  font-size: 13px; font-weight: 600; transition: var(--transition);
}
.phone-btn { background: var(--success); color: white; }
.phone-btn:hover { background: #15653D; }
.email-btn { background: var(--bg); border: 1px solid var(--border); color: var(--text-body); }
.email-btn:hover { background: var(--primary-light); border-color: var(--navy); color: var(--navy); }

/* Sidebar CTA */
.sidebar-actions { display: flex; flex-direction: column; gap: 10px; }

/* Overview */
.overview-card { padding: 18px 20px; }
.overview-card h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-family: var(--font-body); font-weight: 600; margin-bottom: 12px; }
.overview-list { display: flex; flex-direction: column; }
.overview-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border-light); font-size: 13px; }
.overview-row:last-child { border-bottom: none; }
.overview-row span:first-child { color: var(--text-light); }
.overview-row span:last-child  { font-weight: 600; color: var(--text); }

/* Status notice */
.status-notice {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; background: #FFFBEB;
  border: 1px solid #FCD34D; border-radius: var(--radius);
  font-size: 13px; color: #92400E;
}
.status-notice span { font-size: 16px; flex-shrink: 0; }
.status-notice p { margin: 0; line-height: 1.5; }

.owner-notice {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px; background: var(--primary-light);
  border: 1px solid rgba(15,45,82,0.15); border-radius: var(--radius);
  text-align: center; font-size: 13px; color: var(--navy);
}
.owner-notice span { font-size: 22px; }
.owner-notice p { margin: 0; font-weight: 600; }

/* Modals */
.modal-property-title {
  font-weight: 600; color: var(--navy); font-size: 14px;
  margin-bottom: 16px; padding: 10px 12px;
  background: var(--primary-light); border-radius: 8px;
}

@media (max-width: 1024px) { .detail-layout { grid-template-columns: 1fr; } .detail-sidebar { position: static; } }
@media (max-width: 768px) {
  .key-features { grid-template-columns: repeat(3, 1fr); }
  .amenities-grid { grid-template-columns: 1fr 1fr; }
}

/* ── Gallery arrows ── */
.gallery-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: none;
  font-size: 22px; font-weight: 300; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 2; transition: var(--transition);
  box-shadow: 0 2px 12px rgba(0,0,0,0.15); line-height: 1;
}
.gallery-arrow:hover { background: white; box-shadow: var(--shadow-md); }
.gallery-arrow-left  { left: 12px; }
.gallery-arrow-right { right: 12px; }

/* ── Detail tabs ── */
.detail-tabs {
  display: flex; gap: 0;
  background: white; border-radius: var(--radius-lg);
  border: 1px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.detail-tab {
  flex: 1; padding: 12px 16px; border: none; background: none;
  font-size: 13px; font-weight: 600; color: var(--text-muted);
  cursor: pointer; transition: var(--transition); border-bottom: 2px solid transparent;
}
.detail-tab:hover  { color: var(--navy); background: var(--bg); }
.detail-tab.active { color: var(--navy); border-bottom-color: var(--gold); background: var(--primary-light); }
.detail-tab:not(:last-child) { border-right: 1px solid var(--border-light); }

/* ── Agent row ── */
.agent-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; padding: 6px 10px; background: var(--bg); border-radius: 6px; }
.agent-row span { flex-shrink: 0; }
.agent-row strong { color: var(--text); font-weight: 600; }

/* ── EMI Calculator ── */
.emi-toggle-btn {
  width: 100%; padding: 10px; background: var(--gold-pale);
  border: 1px solid var(--gold-light); border-radius: var(--radius);
  font-size: 13px; font-weight: 600; color: var(--warning);
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 7px;
}
.emi-toggle-btn:hover { background: var(--gold); color: white; border-color: var(--gold); }

.emi-calc { background: var(--bg); border-radius: var(--radius-md); border: 1px solid var(--border-light); overflow: hidden; }

.emi-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--navy); }
.emi-header h3 { font-size: 15px; color: white; margin: 0; }
.emi-close { background: rgba(255,255,255,0.15); border: none; color: white; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; }

.emi-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.emi-field { display: flex; flex-direction: column; gap: 5px; }
.emi-field-header { display: flex; justify-content: space-between; align-items: center; }
.emi-field-header label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.emi-field-header span  { font-size: 13px; font-weight: 700; color: var(--navy); }

.emi-range {
  -webkit-appearance: none; width: 100%; height: 4px;
  background: var(--border); border-radius: 2px; outline: none; cursor: pointer;
}
.emi-range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: var(--navy); cursor: pointer; border: 2px solid white;
  box-shadow: 0 1px 4px rgba(15,45,82,0.3);
}
.emi-range-limits { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }

.emi-result { background: white; border-radius: var(--radius); padding: 14px; border: 1px solid var(--border-light); }
.emi-monthly { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-light); }
.emi-lbl { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.emi-val { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--navy); }
.emi-breakdown { display: flex; flex-direction: column; gap: 5px; }
.emi-breakdown div { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
.emi-breakdown div span:last-child { font-weight: 600; color: var(--text); }
.emi-total { padding-top: 6px; border-top: 1px solid var(--border-light); }
.emi-total span:last-child { color: var(--navy) !important; font-weight: 700 !important; }

.sidebar-emi { margin-top: 2px; }

/* Inline EMI in tab */
.detail-card .emi-calc { margin-top: 0; }
.detail-card .emi-toggle-btn { display: none; }
`;

export default PropertyDetail;
