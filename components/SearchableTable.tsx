// @ts-nocheck

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface Result {
  id: string;
  assignee?: {
    firstName: string;
    lastName: string;
  };
  category?: string;
  decommissioned?: boolean;
  inMaintenance?: boolean;
  lastMaintenance?: string;
  location?: {
    stationName: string;
  };
  manufactured?: string;
  model?: string;
  modelId?: string;
  notes?: string;
  serial?: string;
  size?: string;
  verified?: boolean;
  manufacturer?: string;
}

const fetchResults = async (query: string, page: number, pageSize: number) => {
  const res = await fetch(`/api/search?q=${query}&page=${page}&pageSize=${pageSize}`);
  return res.json();
};

const getUniqueValues = (items: Result[], key: keyof Result) => {
  return Array.from(new Set(items.map((item) => item[key]).filter(Boolean)));
};

const renderCellValue = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return value.firstName && value.lastName
      ? `${value.firstName} ${value.lastName}`
      : value.stationName || JSON.stringify(value);
  }

  const date = new Date(value);
  return !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : String(value);
};

const sortData = (data: Result[], order: 'asc' | 'desc', key: keyof Result) => {
  return [...data].sort((a, b) => {
    let valA = '';
    let valB = '';

    if (key === 'assignee' && a.assignee && b.assignee) {
      valA = `${a.assignee.firstName} ${a.assignee.lastName}`.toLowerCase();
      valB = `${b.assignee.firstName} ${b.assignee.lastName}`.toLowerCase();
    } else {
      valA = (a[key]?.toString().toLowerCase() ?? '');
      valB = (b[key]?.toString().toLowerCase() ?? '');
    }

    return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
};


const SearchableTable: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleFetchResults = useCallback(async () => {
    setLoading(true);
    const data = await fetchResults(query.trim(), currentPage, pageSize);
    setResults(Array.isArray(data.documents) ? data.documents : []);
    setTotalResults(data.totalResults);
    setLoading(false);
  }, [query, currentPage, pageSize]);

  const categories = useMemo(() => getUniqueValues(results, 'category'), [results]);
  const manufacturers = useMemo(() => getUniqueValues(results, 'manufacturer'), [results]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => handleFetchResults(), 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, handleFetchResults]);

  const sortedResults = useMemo(() => sortData(results, sortOrder, 'assignee'), [results, sortOrder]);

  const filteredResults = useMemo(() => {
    return sortedResults.filter((item) => {
      const manufacturedDate = new Date(item.manufactured || '');
      const isWithinRange =
        (!startDate || manufacturedDate >= new Date(startDate)) &&
        (!endDate || manufacturedDate <= new Date(endDate));

      return (
        (!selectedCategory || item.category === selectedCategory) &&
        (!selectedManufacturer || item.manufacturer === selectedManufacturer) &&
        isWithinRange
      );
    });
  }, [sortedResults, selectedCategory, selectedManufacturer, startDate, endDate]);

  const handleSort = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  const columnHeaders = [
    'Assignee',
    'Category',
    'Decomm.',
    'ID',
    'In Maint.',
    'Last Maint.',
    'Location',
    'Manufact.',
    'Manufacturer',
    'Model',
    'Model ID',
    'Notes',
    'Serial',
    'Size',
    'Verified',
  ];

  return (
    <div className="p-8 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Equipment Search</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment..."
        className="w-full p-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mb-4"
      />

      <div className="flex space-x-4 mb-6">
        <FilterDropdown label="Category" options={categories} value={selectedCategory} onChange={setSelectedCategory} />
        <FilterDropdown label="Manufacturer" options={manufacturers} value={selectedManufacturer} onChange={setSelectedManufacturer} />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-2 p-2 border-2 border-gray-400 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">End Date:</label>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-2 p-2 border-2 border-gray-400 rounded-md"
          />
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        {loading ? (
          <div className="text-center py-4 text-gray-600 animate-pulse">🔄 Loading...</div>
        ) : (
          <Table columnHeaders={columnHeaders} data={filteredResults} onSort={handleSort} sortOrder={sortOrder} />
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex-1">
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
    >
      <option value="">All {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const Table = ({
  columnHeaders,
  data,
  onSort,
  sortOrder,
}: {
  columnHeaders: string[];
  data: Result[];
  onSort: () => void;
  sortOrder: 'asc' | 'desc';
}) => (
  <table className="min-w-full bg-white rounded-lg shadow-lg">
    <thead className="bg-blue-600 text-white">
      <tr>
        {columnHeaders.map((header) => (
          <th
            key={header}
            className="table-header py-4 px-4 border-b border-gray-300 text-left text-sm font-semibold cursor-pointer"
            onClick={header === 'Assignee' ? onSort : undefined}
          >
            {header}
            {header === 'Assignee' && (
              <span className="inline-flex items-center ml-2">
                {sortOrder === 'asc' ? <i className="fas fa-sort-up" /> : <i className="fas fa-sort-down" />}
              </span>
            )}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? (
        data.map((result) => (
          <tr key={result.id} className="hover:bg-blue-100 transition-colors duration-200">
            <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.assignee)}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.category}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.decommissioned ? 'Yes' : 'No'}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.id}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.inMaintenance ? 'Yes' : 'No'}</td>
            <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.lastMaintenance)}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.location?.stationName}</td>
            <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.manufactured)}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.manufacturer}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.model}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.modelId}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.notes}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.serial}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.size}</td>
            <td className="py-3 px-4 border-b border-gray-300">{result.verified ? 'Yes' : 'No'}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={columnHeaders.length} className="py-3 px-4 border-b border-gray-300 text-center text-gray-600">
            No results found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);


const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="mt-6 flex justify-between items-center">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
    >
      Previous
    </button>
    <span>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
    >
      Next
    </button>
  </div>
);

export default SearchableTable;
