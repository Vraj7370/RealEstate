import React, { useState } from 'react';
import { PROPERTY_TYPES, CITIES } from '../../utils/helpers';
import './SearchFilter.css';

const SearchFilter = ({ onSearch, initialValues = {}, compact = false }) => {
  const [filters, setFilters] = useState({
    search: '', listingType: 'Sale', propertyType: '', city: '',
    minPrice: '', maxPrice: '', bedrooms: '', ...initialValues
  });

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    onSearch(clean);
  };

  if (compact) return (
    <form className="search-bar-compact" onSubmit={handleSubmit}>
      <div className="search-tabs">
        {['Sale', 'Rent'].map(t => (
          <button type="button" key={t} className={`tab-btn ${filters.listingType === t ? 'active' : ''}`}
            onClick={() => set('listingType', t)}>{t}</button>
        ))}
      </div>
      <div className="search-inputs">
        <input className="search-input" placeholder="Search city, locality, project..." value={filters.search}
          onChange={e => set('search', e.target.value)} />
        <select className="search-select" value={filters.propertyType} onChange={e => set('propertyType', e.target.value)}>
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="btn btn-primary search-btn">🔍 Search</button>
      </div>
    </form>
  );

  return (
    <form className="search-filter" onSubmit={handleSubmit}>
      <div className="filter-section">
        <label className="filter-label">Looking to</label>
        <div className="filter-tabs">
          {['Sale', 'Rent'].map(t => (
            <button type="button" key={t} className={`filter-tab ${filters.listingType === t ? 'active' : ''}`}
              onClick={() => set('listingType', t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label>Search</label>
          <input className="form-control" placeholder="City, locality, project..." value={filters.search}
            onChange={e => set('search', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>City</label>
          <select className="form-control" value={filters.city} onChange={e => set('city', e.target.value)}>
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Property Type</label>
          <select className="form-control" value={filters.propertyType} onChange={e => set('propertyType', e.target.value)}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Min Price</label>
          <input type="number" className="form-control" placeholder="₹ Min" value={filters.minPrice}
            onChange={e => set('minPrice', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Max Price</label>
          <input type="number" className="form-control" placeholder="₹ Max" value={filters.maxPrice}
            onChange={e => set('maxPrice', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Bedrooms</label>
          <select className="form-control" value={filters.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+ BHK</option>)}
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setFilters({ search: '', listingType: 'Sale', propertyType: '', city: '', minPrice: '', maxPrice: '', bedrooms: '' })}>
          Clear All
        </button>
        <button type="submit" className="btn btn-primary">🔍 Apply Filters</button>
      </div>
    </form>
  );
};

export default SearchFilter;
