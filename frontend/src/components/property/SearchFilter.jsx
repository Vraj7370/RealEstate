import React, { useState } from 'react';
import { PROPERTY_TYPES, CITIES } from '../../utils/helpers';
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
    <>
      <style>{componentStyles}</style>
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
    </>
  );

  return (
    <>
      <style>{componentStyles}</style>
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
    </>
  );
};


const componentStyles = `/* ══ SEARCH FILTER ══ */

/* Compact (hero) */
.search-bar-compact { background: white; border-radius: var(--radius-lg); overflow: hidden; }

.search-tabs { display: flex; border-bottom: 1px solid var(--border-light); }

.tab-btn {
  padding: 12px 24px; background: none; border: none;
  font-weight: 600; font-size: 13px; color: var(--text-muted);
  cursor: pointer; transition: var(--transition);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  letter-spacing: 0.01em;
}
.tab-btn.active { color: var(--navy); border-bottom-color: var(--gold); }
.tab-btn:hover:not(.active) { color: var(--text); }

.search-inputs { display: flex; }
.search-input {
  flex: 1; padding: 15px 20px; border: none;
  font-size: 14px; color: var(--text); outline: none;
}
.search-input::placeholder { color: var(--text-muted); }

.search-divider { width: 1px; background: var(--border-light); margin: 10px 0; }

.search-select {
  padding: 15px 16px; border: none; border-left: 1px solid var(--border-light);
  font-size: 13px; color: var(--text-body); outline: none;
  cursor: pointer; background: white; min-width: 140px;
}
.search-btn {
  border-radius: 0 !important; padding: 15px 28px !important;
  font-size: 14px !important; background: var(--navy) !important;
}
.search-btn:hover { background: var(--navy-light) !important; }

/* Full filter panel */
.search-filter {
  background: white; border-radius: var(--radius-lg);
  padding: 20px; border: 1px solid var(--border-light);
}
.filter-section { margin-bottom: 16px; }
.filter-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: var(--text-muted); margin-bottom: 8px; display: block;
}
.filter-tabs { display: flex; gap: 6px; }
.filter-tab {
  padding: 7px 18px; border-radius: var(--radius);
  border: 1.5px solid var(--border); background: none;
  font-weight: 600; font-size: 13px; color: var(--text-muted);
  cursor: pointer; transition: var(--transition);
}
.filter-tab.active { background: var(--navy); color: white; border-color: var(--navy); }
.filter-tab:hover:not(.active) { border-color: var(--navy); color: var(--navy); }

.filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.filter-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }

.filter-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px; border-top: 1px solid var(--border-light); }

@media (max-width: 768px) {
  .filter-grid  { grid-template-columns: 1fr; }
  .search-inputs { flex-direction: column; }
  .search-select { border-left: none; border-top: 1px solid var(--border-light); }
}
`;

export default SearchFilter;
