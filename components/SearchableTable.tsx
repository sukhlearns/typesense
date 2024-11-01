// @ts-nocheck

import { useState, useEffect } from 'react';

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
  manufacturer?: string;
  model?: string;
  modelId?: string;
  notes?: string;
  serial?: string;
  size?: string;
  verified?: boolean;
}

const SearchableTable = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Result[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchResults = async (page: number) => {
    const searchQuery = query.trim() !== '' ? query : '';
    setLoading(true);
    const res = await fetch(`/api/search?q=${searchQuery}&page=${page}&pageSize=${pageSize}`);
    const data = await res.json();
    setResults(Array.isArray(data.documents) ? data.documents : []);
    setTotalResults(data.totalResults);
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 when a new search is performed
    fetchResults(1); // Fetch results for the first page
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    // Fetch results whenever the current page changes
    fetchResults(currentPage);
  }, [currentPage]);

  const columnHeaders = [
    'Assignee',
    'Category',
    'Decommissioned',
    'ID',
    'In Maintenance',
    'Last Maintenance',
    'Location',
    'Manufactured',
    'Manufacturer',
    'Model',
    'Model ID',
    'Notes',
    'Serial',
    'Size',
    'Verified',
  ];

  const renderCellValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`;
      } else if (value.stationName) {
        return value.stationName;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Equipment Search</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment..."
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
      />
      <div className="overflow-x-auto mt-4">
        {loading ? (
          <div className="text-center py-4 text-gray-600">Loading...</div>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                {columnHeaders.map((header) => (
                  <th key={header} className="py-3 px-4 border-b border-gray-300 text-left text-sm font-medium text-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.assignee)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.category}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{String(item.decommissioned)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.id}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{String(item.inMaintenance)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.lastMaintenance}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.location)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.manufactured}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.manufacturer}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.model}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.modelId}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.notes}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.serial}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.size}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{String(item.verified)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columnHeaders.length} className="py-3 px-4 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 transition duration-200"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchableTable;
