// @ts-nocheck

import React, { useState, useEffect } from 'react';
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
  manufactured?: string; // Assuming this is a date string
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
  const [sortOrder, setSortOrder] = useState<{ [key: string]: 'asc' | 'desc' }>({
    assignee: 'asc',
    manufactured: 'asc',
  });
  const [sortedResults, setSortedResults] = useState<Result[]>([]);

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

  useEffect(() => {
    // Sort results based on the current sort order
    const sortedData = [...results].sort((a, b) => {
      const assigneeA = (a.assignee?.firstName || '') + ' ' + (a.assignee?.lastName || '');
      const assigneeB = (b.assignee?.firstName || '') + ' ' + (b.assignee?.lastName || '');
      const manufacturedA = a.manufactured ? new Date(a.manufactured).getTime() : 0;
      const manufacturedB = b.manufactured ? new Date(b.manufactured).getTime() : 0;

      if (sortOrder.assignee === 'asc') {
        if (assigneeA < assigneeB) return -1;
        if (assigneeA > assigneeB) return 1;
      } else {
        if (assigneeA < assigneeB) return 1;
        if (assigneeA > assigneeB) return -1;
      }

      if (sortOrder.manufactured === 'asc') {
        return manufacturedA - manufacturedB;
      } else {
        return manufacturedB - manufacturedA;
      }
    });
    setSortedResults(sortedData);
  }, [results, sortOrder]);

  // Shortened header names
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

  const renderCellValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`;
      } else if (value.stationName) {
        return value.stationName;
      }
      return JSON.stringify(value);
    }
  
    // Format date strings for 'lastMaintenance' and 'manufactured'
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) { // Check if the date is valid
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } else {
        console.warn(`Invalid date: ${value}`); // Log any invalid dates for debugging
      }
    }
  
    return String(value);
  };
  
  const handleSort = (column: 'assignee' | 'manufactured') => {
    setSortOrder((prevOrder) => ({
      ...prevOrder,
      [column]: prevOrder[column] === 'asc' ? 'desc' : 'asc',
    }));
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
                  <th
                    key={header}
                    className="table-header py-3 px-4 border-b border-gray-300 text-left text-sm font-medium text-gray-700"
                    onClick={header === 'Assignee' || header === 'Manufact.' ? () => handleSort(header === 'Assignee' ? 'assignee' : 'manufactured') : undefined}
                    style={{
                      cursor: header === 'Assignee' || header === 'Manufact.' ? 'pointer' : 'default',
                      whiteSpace: 'nowrap', // Prevents wrapping
                      overflow: 'hidden',    // Hides overflow content
                      textOverflow: 'ellipsis', // Adds ellipsis for overflow text
                      minWidth: '100px',     // Sets a minimum width for the headers
                    }}
                  >
                    {header} {header === 'Assignee' && (sortOrder.assignee === 'asc' ? '▲' : '▼')}
                    {header === 'Manufact.' && (sortOrder.manufactured === 'asc' ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedResults.length > 0 ? (
                sortedResults.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.assignee)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.category}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{String(item.decommissioned)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{item.id}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{String(item.inMaintenance)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.lastMaintenance)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.location)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(item.manufactured)}</td>
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
                  <td colSpan={columnHeaders.length} className="py-3 px-4 text-center">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`py-2 px-4 text-white rounded-lg ${currentPage === 1 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`py-2 px-4 text-white rounded-lg ${currentPage === totalPages ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchableTable;
