import React from 'react';
import { Search, X, RotateCcw, Filter, ArrowUpDown } from 'lucide-react';

export function FilterControls({
  search,
  setSearch,
  category,
  setCategory,
  theme,
  setTheme,
  org,
  setOrg,
  submissionCap,
  setSubmissionCap,
  sortBy,
  setSortBy,
  themesList = [],
  orgsList = [],
  showSubmissionPresets = true,
  onReset,
  totalCount = 0,
  filteredCount = 0,
}) {
  const isFiltered =
    search !== '' ||
    category !== 'ALL' ||
    theme !== 'ALL' ||
    org !== 'ALL' ||
    submissionCap !== 'ALL' ||
    sortBy !== 'ideas-asc';

  return (
    <div className="filter-panel brutalist-container brutalist-shadow" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      {/* Search Input Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-color)',
            opacity: 0.6,
          }}
        />
        <input
          type="text"
          placeholder="SEARCH TITLE, PS ID (e.g. SIH26001), THEME, OR ORG..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search-input"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-color)',
            }}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Row: Category Toggle Pills & Submission Cap Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7, marginRight: '0.2rem' }}>
            CATEGORY:
          </span>
          {['ALL', 'SOFTWARE', 'HARDWARE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`filter-pill-btn ${category === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Submission Threshold Presets */}
        {showSubmissionPresets && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7, marginRight: '0.2rem' }}>
              SUBMISSIONS:
            </span>
            {[
              { label: 'ALL', val: 'ALL' },
              { label: '0 IDEAS', val: '0' },
              { label: '≤ 5', val: '5' },
              { label: '≤ 10', val: '10' },
              { label: '≤ 20', val: '20' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setSubmissionCap(preset.val)}
                className={`filter-pill-btn ${submissionCap === preset.val ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Select Dropdowns: Theme, Organization, Sort By */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Theme Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.8 }}>
            THEME ({themesList.length})
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">ALL THEMES</option>
            {themesList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Organization / Ministry Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.8 }}>
            MINISTRY / ORG ({orgsList.length})
          </label>
          <select
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">ALL ORGANIZATIONS</option>
            {orgsList.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.8 }}>
            SORT BY
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="ideas-asc">SUBMISSIONS: LOWEST FIRST (NICHE)</option>
            <option value="ideas-desc">SUBMISSIONS: HIGHEST FIRST (POPULAR)</option>
            <option value="ps-asc">PS ID: ASCENDING (SIH26001...)</option>
            <option value="ps-desc">PS ID: DESCENDING (SIH26231...)</option>
            <option value="title-asc">TITLE: A → Z</option>
            <option value="org-asc">ORGANIZATION: A → Z</option>
          </select>
        </div>
      </div>

      {/* Bottom Bar: Stats & Reset Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '2px dashed var(--border-color)' }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
          SHOWING {filteredCount} / {totalCount} PROBLEM STATEMENTS
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="filter-reset-btn"
          >
            <RotateCcw size={14} />
            RESET ALL FILTERS
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterControls;
