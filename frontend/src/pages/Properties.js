import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilter from '../components/property/SearchFilter';
import './Properties.css';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'area-desc', label: 'Largest Area' },
  { value: 'views-desc', label: 'Most Viewed' },
];

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState('createdAt-desc');

  const getFilters = useCallback(() => {
    const obj = {};
    searchParams.forEach((v, k) => { if (v) obj[k] = v; });
    return obj;
  }, [searchParams]);

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sort.split('-');
      const filters = getFilters();
      const { data } = await propertyAPI.getAll({ ...filters, page, limit: 12, sortBy, sortOrder });
      setProperties(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sort, getFilters]);

  useEffect(() => { fetchProperties(1); }, [fetchProperties]);

  const handleSearch = (filters) => {
    setSearchParams(filters);
    setShowFilter(false);
  };

  const handlePageChange = (page) => {
    fetchProperties(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters = getFilters();
  const activeFilterCount = Object.keys(filters).filter(k => !['page', 'limit'].includes(k)).length;

  return (
    <div className="properties-page">
      <div className="properties-header">
        <div className="container">
          <div className="properties-header-inner">
            <div>
              <h1>
                {filters.listingType === 'Rent' ? 'Properties for Rent' :
                 filters.listingType === 'Sale' ? 'Properties for Sale' :
                 filters.city ? `Properties in ${filters.city}` : 'All Properties'}
              </h1>
              {!loading && (
                <p className="results-count">
                  {pagination.total || 0} properties found
                  {filters.city && ` in ${filters.city}`}
                </p>
              )}
            </div>
            <div className="header-actions">
              <button className="btn btn-outline btn-sm filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
                🔧 Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="filter-panel">
          <div className="container">
            <SearchFilter onSearch={handleSearch} initialValues={filters} />
          </div>
        </div>
      )}

      <div className="container properties-content">
        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <div className="active-filters">
            {Object.entries(filters).map(([k, v]) => (
              <div key={k} className="active-filter-tag">
                <span>{k}: {v}</span>
                <button onClick={() => {
                  const updated = { ...filters };
                  delete updated[k];
                  setSearchParams(updated);
                }}>✕</button>
              </div>
            ))}
            <button className="clear-all-btn" onClick={() => setSearchParams({})}>Clear All</button>
          </div>
        )}

        {loading ? (
          <div className="properties-skeleton">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line w-50" />
                  <div className="skeleton-line w-80" />
                  <div className="skeleton-line w-60" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>🏚️</div>
            <h3>No properties found</h3>
            <p>Try adjusting your search filters</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setSearchParams({})}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-4">
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>←</button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={pagination.page === pagination.pages} onClick={() => handlePageChange(pagination.page + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
