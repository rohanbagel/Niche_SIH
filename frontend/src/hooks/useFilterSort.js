import { useState, useMemo } from 'react';

export function useFilterSort(data = [], { defaultSort = 'ideas-asc', defaultCap = 'ALL' } = {}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [theme, setTheme] = useState('ALL');
  const [org, setOrg] = useState('ALL');
  const [submissionCap, setSubmissionCap] = useState(defaultCap);
  const [sortBy, setSortBy] = useState(defaultSort);

  // Extract unique themes and organizations from the data
  const { themesList, orgsList } = useMemo(() => {
    const themes = new Set();
    const orgs = new Set();

    data.forEach((ps) => {
      if (ps.theme && ps.theme.trim()) themes.add(ps.theme.trim());
      if (ps.org && ps.org.trim()) orgs.add(ps.org.trim());
    });

    return {
      themesList: Array.from(themes).sort((a, b) => a.localeCompare(b)),
      orgsList: Array.from(orgs).sort((a, b) => a.localeCompare(b)),
    };
  }, [data]);

  // Filter and sort the problem statements
  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // 1. Search Query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((ps) => {
        const titleMatch = ps.title && ps.title.toLowerCase().includes(q);
        const psNumberMatch = ps.psNumber && ps.psNumber.toLowerCase().includes(q);
        const themeMatch = ps.theme && ps.theme.toLowerCase().includes(q);
        const orgMatch = ps.org && ps.org.toLowerCase().includes(q);
        const descMatch = ps.description && ps.description.toLowerCase().includes(q);
        return titleMatch || psNumberMatch || themeMatch || orgMatch || descMatch;
      });
    }

    // 2. Category Filter
    if (category !== 'ALL') {
      result = result.filter(
        (ps) => ps.category && ps.category.toUpperCase() === category.toUpperCase()
      );
    }

    // 3. Theme Filter
    if (theme !== 'ALL') {
      result = result.filter((ps) => ps.theme && ps.theme.trim() === theme);
    }

    // 4. Organization Filter
    if (org !== 'ALL') {
      result = result.filter((ps) => ps.org && ps.org.trim() === org);
    }

    // 5. Submission Cap Filter
    if (submissionCap !== 'ALL') {
      const cap = parseInt(submissionCap, 10);
      if (!isNaN(cap)) {
        if (cap === 0) {
          result = result.filter((ps) => (ps.ideasCount || 0) === 0);
        } else {
          result = result.filter((ps) => (ps.ideasCount || 0) <= cap);
        }
      }
    }

    // 6. Sorting
    result.sort((a, b) => {
      const aCount = a.ideasCount || 0;
      const bCount = b.ideasCount || 0;

      switch (sortBy) {
        case 'ideas-asc':
          return aCount !== bCount ? aCount - bCount : (a.sno || 0) - (b.sno || 0);
        case 'ideas-desc':
          return aCount !== bCount ? bCount - aCount : (a.sno || 0) - (b.sno || 0);
        case 'ps-asc':
          return (a.psNumber || '').localeCompare(b.psNumber || '', undefined, { numeric: true });
        case 'ps-desc':
          return (b.psNumber || '').localeCompare(a.psNumber || '', undefined, { numeric: true });
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'org-asc':
          return (a.org || '').localeCompare(b.org || '');
        default:
          return 0;
      }
    });

    return result;
  }, [data, search, category, theme, org, submissionCap, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setTheme('ALL');
    setOrg('ALL');
    setSubmissionCap(defaultCap);
    setSortBy(defaultSort);
  };

  return {
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
    themesList,
    orgsList,
    filteredAndSorted,
    resetFilters,
  };
}

export default useFilterSort;
