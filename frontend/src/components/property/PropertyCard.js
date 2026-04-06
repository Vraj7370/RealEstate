import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favoriteAPI } from '../../utils/api';
import { formatPrice, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './PropertyCard.css';

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
  );
};

export default PropertyCard;
