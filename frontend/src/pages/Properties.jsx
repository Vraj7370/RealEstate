import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilter from '../components/property/SearchFilter';
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
    <>
      <style>{componentStyles}</style>
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
    </>
  );
};


const componentStyles = `/* ══ PROPERTIES LIST PAGE ══ */
.properties-header {
  background: white; border-bottom: 1px solid var(--border-light);
  padding: 20px 0; position: sticky; top: 64px; z-index: 50;
  box-shadow: var(--shadow-xs);
}
.properties-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.properties-header h1 { font-size: 22px; color: var(--text); font-weight: 600; }
.results-count { font-size: 13px; color: var(--text-muted); margin-top: 3px; }

.header-actions { display: flex; align-items: center; gap: 10px; }

.filter-toggle-btn { position: relative; }
.filter-badge {
  background: var(--navy); color: white; border-radius: 50%;
  width: 16px; height: 16px; font-size: 9px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; margin-left: 5px;
}

.sort-select {
  padding: 7px 12px; border: 1.5px solid var(--border);
  border-radius: var(--radius); font-size: 13px; font-weight: 500;
  color: var(--text-body); outline: none; background: white; cursor: pointer;
}
.sort-select:focus { border-color: var(--navy); }

.filter-panel { background: var(--bg); border-bottom: 1px solid var(--border-light); padding: 18px 0; }

.properties-content { padding: 28px 0 64px; }

/* Active filters */
.active-filters { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 20px; }

.active-filter-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; background: var(--primary-light);
  color: var(--navy); border-radius: 100px;
  font-size: 11px; font-weight: 600; border: 1px solid rgba(15,45,82,0.15);
}
.active-filter-tag button { background: none; border: none; color: var(--navy); cursor: pointer; font-size: 12px; padding: 0; line-height: 1; }
.clear-all-btn { background: none; border: none; color: var(--danger); font-size: 12px; font-weight: 600; cursor: pointer; margin-left: auto; }

/* Skeleton */
.properties-skeleton { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.skeleton-card { background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-light); }
.skeleton-img  { height: 185px; background: linear-gradient(90deg, #f0f2f5 25%, #e4e8ed 50%, #f0f2f5 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; }
.skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.skeleton-line { height: 11px; background: linear-gradient(90deg, #f0f2f5 25%, #e4e8ed 50%, #f0f2f5 75%); background-size: 400% 100%; animation: shimmer 1.4s infinite; border-radius: 4px; }
.w-40 { width: 40%; } .w-70 { width: 70%; } .w-55 { width: 55%; }
@keyframes shimmer { to { background-position: -400% 0; } }

@media (max-width: 1024px) { .properties-skeleton { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .properties-header { position: relative; top: 0; } .properties-skeleton { grid-template-columns: 1fr; } }
`;

export default Properties;
