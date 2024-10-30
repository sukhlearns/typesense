// @ts-nocheck

import { useState, useEffect } from 'react';

interface Result {
  id: string; // Adjust based on your document structure
  assignee?: {
    firstName: string;
    lastName: string;
  };
  category?: string;
  decommissioned?: boolean;
  inMaintenance?: boolean;
  lastMaintenance?: string; // Adjust type based on your date format
  location?: {
    stationId: string;
    stationName: string;
  };
  manufactured?: string; // Adjust based on your data
  manufacturer?: string; // Adjust based on your data
  model?: string; // Adjust based on your data
  modelId?: string; // Adjust based on your data
  notes?: string; // Adjust based on your data
  serial?: string; // Adjust based on your data
  size?: string; // Adjust based on your data
  verified?: boolean;
  [key: string]: any; // Use this for additional dynamic fields if necessary
}

const SearchableTable = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Result[]>([]);

  const handleSearch = async () => {
    if (query.trim() === '') {
      setResults([]); // Clear results if query is empty
      return;
    }

    const res = await fetch(`/api/search?q=${query}`);
    const data: Result[] = await res.json(); // Specify the expected data type
    console.log(data); // Log the API response to inspect its structure
    setResults(Array.isArray(data) ? data : []);
  };

  // Effect to trigger search whenever query changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 300); // Adjust debounce time as needed

    return () => clearTimeout(debounceTimeout); // Cleanup on unmount or when query changes
  }, [query]);

  const renderCellValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      // Handle specific object fields
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`; // Example for assignee
      } else if (value.stationName) {
        return value.stationName; // For location object
      }
      return JSON.stringify(value); // Fallback for other objects
    }
    return String(value); // Default case for strings, numbers, etc.
  };

  // Define the column headers
  const columnHeaders = [
    'Assignee',
    'Category',
    'Decommissioned',
    'ID',
    'InMaintenance',
    'LastMaintenance',
    'Location',
    'Manufactured',
    'Manufacturer',
    'Model',
    'ModelId',
    'Notes',
    'Serial',
    'Size',
    'Verified',
  ];

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search equipment..."
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {columnHeaders.map((header) => (
                <th key={header} className="py-2 px-4 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 px-4 border-b">{renderCellValue(item.assignee)}</td>
                  <td className="py-2 px-4 border-b">{item.category}</td>
                  <td className="py-2 px-4 border-b">{String(item.decommissioned)}</td>
                  <td className="py-2 px-4 border-b">{item.id}</td>
                  <td className="py-2 px-4 border-b">{String(item.inMaintenance)}</td>
                  <td className="py-2 px-4 border-b">{item.lastMaintenance}</td>
                  <td className="py-2 px-4 border-b">{renderCellValue(item.location)}</td>
                  <td className="py-2 px-4 border-b">{item.manufactured}</td>
                  <td className="py-2 px-4 border-b">{item.manufacturer}</td>
                  <td className="py-2 px-4 border-b">{item.model}</td>
                  <td className="py-2 px-4 border-b">{item.modelId}</td>
                  <td className="py-2 px-4 border-b">{item.notes}</td>
                  <td className="py-2 px-4 border-b">{item.serial}</td>
                  <td className="py-2 px-4 border-b">{item.size}</td>
                  <td className="py-2 px-4 border-b">{String(item.verified)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnHeaders.length} className="py-2 px-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchableTable;
