import React from 'react';
import { useProblemStatements } from '../hooks/useProblemStatements';
import { useFilterSort } from '../hooks/useFilterSort';
import { PSCard } from '../components/PSCard';
import { FilterControls } from '../components/FilterControls';

export function All() {
  const { data, loading, error } = useProblemStatements();

  const {
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
    onlyNewDrops,
    setOnlyNewDrops,
    newDropsCount,
    sortBy,
    setSortBy,
    themesList,
    orgsList,
    filteredAndSorted,
    resetFilters,
  } = useFilterSort(data, { defaultSort: 'ps-asc', defaultCap: 'ALL' });

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.25rem' }}>
        LOADING_ALL_PS_DATA...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center', color: 'red', fontFamily: 'monospace' }}>
        ERROR_FETCHING_DATA: {error}
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '3px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', margin: 0, textTransform: 'uppercase' }}>
          ALL PS
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '1.05rem', marginTop: '0.5rem', opacity: 0.85 }}>
          Browse, filter, and inspect all official SIH 2026 problem statements with live submission counts.
        </p>
      </div>

      {/* Filter and Sort Controller */}
      <FilterControls
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        theme={theme}
        setTheme={setTheme}
        org={org}
        setOrg={setOrg}
        submissionCap={submissionCap}
        setSubmissionCap={setSubmissionCap}
        onlyNewDrops={onlyNewDrops}
        setOnlyNewDrops={setOnlyNewDrops}
        newDropsCount={newDropsCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        themesList={themesList}
        orgsList={orgsList}
        showSubmissionPresets={true}
        onReset={resetFilters}
        totalCount={data.length}
        filteredCount={filteredAndSorted.length}
      />

      {/* PS Cards List */}
      {filteredAndSorted.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {filteredAndSorted.map((ps) => (
            <PSCard key={ps.psNumber} ps={ps} />
          ))}
        </div>
      ) : (
        <div
          className="brutalist-container brutalist-shadow"
          style={{ padding: '3rem 1.5rem', textAlign: 'center', marginTop: '1rem' }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            NO PROBLEM STATEMENTS FOUND
          </h3>
          <p style={{ fontFamily: 'monospace', fontSize: '0.95rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            No problem statements match your active search or filter criteria.
          </p>
          <button onClick={resetFilters} className="brutalist-button">
            RESET FILTERS
          </button>
        </div>
      )}
    </div>
  );
}

export default All;
