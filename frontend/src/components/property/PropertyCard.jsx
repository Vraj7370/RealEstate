import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favoriteAPI } from '../../utils/api';
import { formatPrice, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';
const PH = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

const PropertyCard = ({ property, onFavoriteChange }) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const img = property.images?.[0] || PH;
  const loc = property.location;

  const handleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Please sign in to save properties'); return; }
    setFavLoading(true);
    try {
      const { data } = await favoriteAPI.toggle(property._id);
      setFavorited(data.isFavorited);
      toast.success(data.message);
      onFavoriteChange?.();
    } catch { toast.error('Failed to update'); }
    setFavLoading(false);
  };

  return (
    <>
      <style>{componentStyles}</style>
    <Link to={`/properties/${property._id}`} className="property-card">
      {/* Image */}
      <div className="property-img-wrap">
        <img
          src={img} alt={property.title} className="property-img"
          onError={e => { e.target.src = PH; }}
          loading="lazy"
        />
        <div className="property-badges">
          <span className={`badge badge-${property.listingType?.toLowerCase()}`}>
            {property.listingType}
          </span>
          {property.featured && <span className="badge badge-featured">★ Featured</span>}
        </div>
        <div className="property-type-tag">{property.propertyType}</div>
        <button
          className={`fav-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavorite} disabled={favLoading}
        >
          {favorited ? '♥' : '♡'}
        </button>
      </div>

      {/* Body */}
      <div className="property-body">
        <div className="property-price">
          {formatPrice(property.price)}
          {property.listingType === 'Rent' && <span className="price-unit">/mo</span>}
        </div>

        <h3 className="property-title">{property.title}</h3>

        <p className="property-location">
          <span>⊙</span>
          {loc?.address ? truncate(loc.address, 36) : `${loc?.city}, ${loc?.state}`}
        </p>

        {/* Feature row */}
        <div className="property-features">
          {property.bedrooms > 0 && (
            <div className="feature">
              <span className="feature-val">{property.bedrooms}</span>
              <span className="feature-lbl">Beds</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="feature">
              <span className="feature-val">{property.bathrooms}</span>
              <span className="feature-lbl">Baths</span>
            </div>
          )}
          <div className="feature">
            <span className="feature-val">{property.area?.toLocaleString()}</span>
            <span className="feature-lbl">Sq.ft</span>
          </div>
          {property.parking && (
            <div className="feature">
              <span className="feature-val">✓</span>
              <span className="feature-lbl">Park</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="property-footer">
          <div className="owner-info">
            <div className="owner-avatar">
              {property.ownerId?.profilePic
                ? <img src={property.ownerId.profilePic} alt="" />
                : property.ownerId?.firstName?.[0]
              }
            </div>
            <span className="owner-name">
              {property.ownerId?.firstName} {property.ownerId?.lastName}
            </span>
          </div>
          <span className="furnishing-pill">{property.furnishing?.split('-')[0]}</span>
        </div>
      </div>
    </Link>
    </>
  );
};


const componentStyles = `/* ══ PROPERTY CARD — clean luxury ══ */
.property-card {
  display: flex; flex-direction: column;
  background: white; border-radius: var(--radius-lg);
  overflow: hidden; border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-slow);
  cursor: pointer;
}
.property-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px) translateZ(0);
  border-color: var(--border);
}

/* Image container — NO blur fix */
.property-img-wrap {
  position: relative;
  padding-top: 62%;
  overflow: hidden;
  background: var(--bg);
  isolation: isolate;          /* creates stacking context, prevents blur */
}

.property-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.property-card:hover .property-img { transform: scale(1.06); }

/* Badges */
.property-badges {
  position: absolute; top: 12px; left: 12px;
  display: flex; gap: 5px; flex-wrap: wrap; z-index: 2;
}
.badge-featured {
  background: rgba(201,168,76,0.9);
  color: white; border: none;
  backdrop-filter: blur(8px);
}

.property-type-tag {
  position: absolute; bottom: 10px; left: 10px; z-index: 2;
  padding: 3px 9px;
  background: rgba(9,29,55,0.75); color: white;
  border-radius: 5px; font-size: 10px; font-weight: 600;
  letter-spacing: 0.5px; text-transform: uppercase;
}

/* Favourite button */
.fav-btn {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer; transition: var(--transition);
  backdrop-filter: blur(4px);
}
.fav-btn:hover { transform: scale(1.12); background: white; }
.fav-btn.active { background: #FEF2F2; }

/* Body */
.property-body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; gap: 0; }

.property-price {
  font-family: var(--font-display);
  font-size: 21px; font-weight: 700;
  color: var(--navy); display: flex;
  align-items: baseline; gap: 4px;
  margin-bottom: 4px;
}
.price-unit { font-size: 12px; font-weight: 400; color: var(--text-light); font-family: var(--font-body); }

.property-title {
  font-size: 14px; font-weight: 600;
  color: var(--text); line-height: 1.45;
  margin-bottom: 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.property-location {
  font-size: 12px; color: var(--text-muted);
  margin-bottom: 12px;
  display: flex; align-items: center; gap: 3px;
}

.property-features {
  display: flex; gap: 0;
  padding: 10px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 12px;
}
.feature {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  flex: 1; font-size: 12px;
}
.feature:not(:last-child) { border-right: 1px solid var(--border-light); }
.feature-val  { font-weight: 600; color: var(--text); font-size: 13px; }
.feature-lbl  { color: var(--text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }

.property-footer {
  display: flex; align-items: center;
  justify-content: space-between; margin-top: auto;
}
.owner-info { display: flex; align-items: center; gap: 7px; }
.owner-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--navy); color: white;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.owner-avatar img { width: 100%; height: 100%; object-fit: cover; }
.owner-name { font-size: 11px; font-weight: 500; color: var(--text-muted); }

.furnishing-pill {
  padding: 2px 8px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 100px; font-size: 10px; color: var(--text-muted);
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;
}
`;

export default PropertyCard;
