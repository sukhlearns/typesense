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
  manufactured?: string;
  model?: string;
  modelId?: string;
  notes?: string;
  serial?: string;
  size?: string;
  verified?: boolean;
  manufacturer?: string;
}

const SearchableTable = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Result[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<{ [key: string]: 'asc' | 'desc' }>({ assignee: 'asc' });
  const [sortedResults, setSortedResults] = useState<Result[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [manufacturers, setManufacturers] = useState<string[]>([]);

  const fetchResults = async (page: number) => {
    // 
    const searchQuery = query.trim() !== '' ? query : '';
    setLoading(true);
    const res = await fetch(`/api/search?q=${searchQuery}&page=${page}&pageSize=${pageSize}`);
    const data = await res.json();
    setResults(Array.isArray(data.documents) ? data.documents : []);
    setTotalResults(data.totalResults);

    const uniqueCategories = Array.from(new Set(data.documents.map((item: Result) => item.category).filter(Boolean)));
    setCategories(uniqueCategories);
    
    const uniqueManufacturers = Array.from(new Set(data.documents.map((item: Result) => item.manufacturer).filter(Boolean)));
    setManufacturers(uniqueManufacturers);

    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResults(1);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const sortedData = [...results].sort((a, b) => {
      const assigneeA = (a.assignee?.firstName || '') + ' ' + (a.assignee?.lastName || '');
      const assigneeB = (b.assignee?.firstName || '') + ' ' + (b.assignee?.lastName || '');
      return sortOrder.assignee === 'asc' ? assigneeA.localeCompare(assigneeB) : assigneeB.localeCompare(assigneeA);
    });
    setSortedResults(sortedData);
  }, [results, sortOrder]);

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
  
    if (typeof value === 'string') {
      // Check if the string is a valid ISO date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // Convert date to a readable format (e.g., Oct 28, 2024)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
  
    return String(value);
  };
  

  const handleSort = (column: 'assignee') => {
    setSortOrder((prevOrder) => ({
      ...prevOrder,
      [column]: prevOrder[column] === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  const filteredResults = sortedResults.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesManufacturer = selectedManufacturer ? item.manufacturer === selectedManufacturer : true;
    return matchesCategory && matchesManufacturer;
  });

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
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Manufacturer:</label>
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="w-full p-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        {loading ? (
          <div className="text-center py-4 text-gray-600 animate-pulse">🔄 Loading...</div>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                {columnHeaders.map((header) => (
                  <th
                    key={header}
                    className="table-header py-4 px-4 border-b border-gray-300 text-left text-sm font-semibold cursor-pointer"
                    onClick={header === 'Assignee' ? () => handleSort('assignee') : undefined}
                  >
                    {header}
                    {header === 'Assignee' && (
                      <span className="inline-flex items-center ml-2">
                        {sortOrder.assignee === 'asc' ? <i className="fas fa-sort-up" /> : <i className="fas fa-sort-down" />}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-blue-100 transition-colors duration-200">
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.assignee)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.category}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.decommissioned ? '✔️' : '❌'}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.id}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.inMaintenance ? '✔️' : '❌'}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.lastMaintenance)}</td>

                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.location)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{renderCellValue(result.manufactured)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.manufacturer}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.model}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.modelId}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.notes}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.serial}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.size}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{result.verified ? '✔️' : '❌'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columnHeaders.length} className="py-3 px-4 border-b border-gray-300 text-center text-gray-600">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchableTable;
