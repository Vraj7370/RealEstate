import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../../utils/api';
import { PROPERTY_TYPES, FURNISHING_TYPES, AMENITIES_LIST, CITIES, STATES_OF_INDIA } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ListProperty.css';

const MAX_IMAGES = 10;

const ListProperty = () => {
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image state
  const [imageFiles,    setImageFiles]    = useState([]);   // File objects
  const [imagePreviews, setImagePreviews] = useState([]);   // base64 / blob URLs
  const [dragOver,      setDragOver]      = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'Apartment', listingType: 'Sale',
    price: '', area: '', bedrooms: '', bathrooms: '',
    furnishing: 'Unfurnished', parking: false, amenities: [],
    location: { address: '', city: '', state: '', pincode: '', latitude: '', longitude: '' },
  });

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLoc = (k, v) => setForm(f => ({ ...f, location: { ...f.location, [k]: v } }));

  const toggleAmenity = (a) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));

  // ── Image handling ──────────────────────────────────────
  const addImages = useCallback((files) => {
    const validTypes = ['image/jpeg','image/jpg','image/png','image/webp'];
    const valid = Array.from(files).filter(f => {
      if (!validTypes.includes(f.type)) { toast.error(`${f.name}: Only JPEG/PNG/WEBP allowed`); return false; }
      if (f.size > 10 * 1024 * 1024)    { toast.error(`${f.name}: Max 10 MB per image`);        return false; }
      return true;
    });

    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd = valid.slice(0, remaining);
    if (valid.length > remaining) toast.error(`Max ${MAX_IMAGES} images allowed`);

    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  }, [imageFiles]);

  const removeImage = (idx) => {
    setImageFiles(prev    => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area) { toast.error('Fill all required fields'); return; }
    if (!form.location.city)  { toast.error('Please select a city');  setStep(3); return; }
    if (!form.location.state) { toast.error('Please select a state'); setStep(3); return; }

    setLoading(true);
    setUploadProgress(10);

    try {
      const payload = {
        ...form,
        location:  form.location,
        amenities: form.amenities,
        images:    imageFiles,     // File[] — api.js converts to FormData
      };

      setUploadProgress(40);
      await propertyAPI.create(payload);
      setUploadProgress(100);

      toast.success('Property listed! 🎉 Awaiting admin approval.');
      navigate('/dashboard/my-properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list property');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ── Step nav ────────────────────────────────────────────
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="list-property-page">
      <div className="dash-page-header">
        <h1>List Your Property</h1>
        <p>Fill in the details — all fields marked * are required</p>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="upload-progress-bar">
          <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
          <span>Uploading to Cloudinary… {uploadProgress}%</span>
        </div>
      )}

      {/* Step indicator */}
      <div className="step-indicator">
        {['Basic Info', 'Property Details', 'Location', 'Photos & Submit'].map((label, i) => (
          <div key={label} className={`step-dot ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
            <div className="dot-circle">{step > i+1 ? '✓' : i+1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="list-form">

        {/* ── STEP 1: Basic Info ── */}
        {step === 1 && (
          <div className="dash-card">
            <h2 className="step-title">Basic Information</h2>
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input className="form-control" required maxLength={100}
                placeholder="e.g. 3BHK Spacious Apartment in Bandra West"
                value={form.title} onChange={e => set('title', e.target.value)} />
              <span className="char-count">{form.title.length}/100</span>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={5} required maxLength={2000}
                placeholder="Describe your property — highlights, nearby landmarks, special features…"
                value={form.description} onChange={e => set('description', e.target.value)} />
              <span className="char-count">{form.description.length}/2000</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select className="form-control" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <div className="listing-type-toggle">
                  {['Sale', 'Rent'].map(t => (
                    <button key={t} type="button"
                      className={`toggle-btn ${form.listingType === t ? 'active' : ''}`}
                      onClick={() => set('listingType', t)}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {form.listingType === 'Rent' ? 'Monthly Rent (₹) *' : 'Sale Price (₹) *'}
                </label>
                <input type="number" className="form-control" required min={1}
                  placeholder={form.listingType === 'Rent' ? 'e.g. 25000' : 'e.g. 8500000'}
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Carpet Area (sq.ft) *</label>
                <input type="number" className="form-control" required min={1}
                  placeholder="e.g. 1200"
                  value={form.area} onChange={e => set('area', e.target.value)} />
              </div>
            </div>
            <div className="step-nav">
              <div />
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next: Property Details →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Property Details ── */}
        {step === 2 && (
          <div className="dash-card">
            <h2 className="step-title">Property Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select className="form-control" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                  <option value="">Select</option>
                  {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n === 0 ? 'N/A (Studio/Land/Commercial)' : `${n} BHK`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select className="form-control" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                  <option value="">Select</option>
                  {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 0 ? 'N/A' : n}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Furnishing Status</label>
              <div className="furnish-options">
                {FURNISHING_TYPES.map(t => (
                  <label key={t} className={`option-card ${form.furnishing === t ? 'active' : ''}`}>
                    <input type="radio" name="furnishing" value={t} hidden checked={form.furnishing === t} onChange={() => set('furnishing', t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Parking</label>
              <div className="furnish-options">
                {[true, false].map(v => (
                  <label key={String(v)} className={`option-card ${form.parking === v ? 'active' : ''}`}>
                    <input type="radio" name="parking" hidden checked={form.parking === v} onChange={() => set('parking', v)} />
                    {v ? '✓ Available' : '✗ Not Available'}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="amenities-checkboxes">
                {AMENITIES_LIST.map(a => (
                  <label key={a} className={`amenity-check-card ${form.amenities.includes(a) ? 'active' : ''}`}>
                    <input type="checkbox" hidden checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>
            <div className="step-nav">
              <button type="button" className="btn btn-ghost" onClick={prevStep}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Next: Location →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Location ── */}
        {step === 3 && (
          <div className="dash-card">
            <h2 className="step-title">Property Location</h2>
            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input className="form-control" required
                placeholder="Flat no, Building name, Street, Area"
                value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-control" required value={form.location.city} onChange={e => setLoc('city', e.target.value)}>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select className="form-control" required value={form.location.state} onChange={e => setLoc('state', e.target.value)}>
                  <option value="">Select State</option>
                  {STATES_OF_INDIA.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" maxLength={6} placeholder="400001"
                  value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude <span style={{color:'var(--text-muted)',fontSize:11}}>(optional)</span></label>
                <input type="number" step="any" className="form-control" placeholder="19.0760"
                  value={form.location.latitude} onChange={e => setLoc('latitude', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude <span style={{color:'var(--text-muted)',fontSize:11}}>(optional)</span></label>
                <input type="number" step="any" className="form-control" placeholder="72.8777"
                  value={form.location.longitude} onChange={e => setLoc('longitude', e.target.value)} />
              </div>
            </div>
            <div className="step-nav">
              <button type="button" className="btn btn-ghost" onClick={prevStep}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Next: Photos →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Photos + Submit ── */}
        {step === 4 && (
          <div className="dash-card">
            <h2 className="step-title">Property Photos & Submit</h2>

            {/* Drag-and-drop upload zone */}
            <div
              className={`image-drop-zone ${dragOver ? 'drag-over' : ''} ${imageFiles.length >= MAX_IMAGES ? 'zone-full' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => imageFiles.length < MAX_IMAGES && fileInput.current?.click()}
            >
              <input
                type="file" ref={fileInput} multiple hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={e => addImages(e.target.files)}
              />
              {imageFiles.length === 0 ? (
                <>
                  <div className="idz-icon">🖼️</div>
                  <p className="idz-title">Drag & drop photos here</p>
                  <p className="idz-sub">or <span className="idz-link">click to browse</span></p>
                  <p className="idz-hint">JPEG, PNG, WEBP · Max 10 MB each · Up to {MAX_IMAGES} photos</p>
                </>
              ) : (
                <p className="idz-more">
                  {imageFiles.length < MAX_IMAGES
                    ? `+ Drop more photos (${imageFiles.length}/${MAX_IMAGES} added)`
                    : `✓ Maximum ${MAX_IMAGES} photos reached`
                  }
                </p>
              )}
            </div>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((src, i) => (
                  <div key={i} className={`img-preview-item ${i === 0 ? 'main-image' : ''}`}>
                    <img src={src} alt={`Preview ${i+1}`} />
                    {i === 0 && <div className="main-label">Cover Photo</div>}
                    <button type="button" className="img-remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      ✕
                    </button>
                    <div className="img-num">{i+1}</div>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <div className="no-images-note">
                ℹ️ Photos are optional but <strong>properties with photos get 5× more inquiries</strong>
              </div>
            )}

            {/* Summary */}
            <div className="preview-summary" style={{ marginTop: 24 }}>
              <h3>📋 Listing Summary</h3>
              <div className="summary-grid">
                <div><strong>Title:</strong> {form.title || '—'}</div>
                <div><strong>Type:</strong> {form.propertyType} for {form.listingType}</div>
                <div><strong>Price:</strong> ₹{Number(form.price || 0).toLocaleString('en-IN')}</div>
                <div><strong>Area:</strong> {form.area || '—'} sq.ft</div>
                <div><strong>Bedrooms:</strong> {form.bedrooms || 0}</div>
                <div><strong>City:</strong> {form.location.city || '—'}</div>
                <div><strong>Amenities:</strong> {form.amenities.length} selected</div>
                <div><strong>Photos:</strong> {imageFiles.length} uploaded</div>
              </div>
            </div>

            <div className="step-nav">
              <button type="button" className="btn btn-ghost" onClick={prevStep}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading
                  ? `Uploading… ${uploadProgress}%`
                  : '🏠 Submit Property Listing'
                }
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ListProperty;
