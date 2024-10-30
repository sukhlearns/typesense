// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/typesenseClient';

interface Document {
  id: string; // Adjust this based on your actual document structure
  serial: string;
  model: string;
  manufacturer: string;
  category: string;
  assignee: {
    firstName: string;
    lastName: string;
  };
  location: {
    stationName: string;
  };
  [key: string]: any; // For additional dynamic fields if necessary
}

// Define a type for the search response hit from Typesense
interface SearchResponseHit {
  document: Document; // The actual document
  // Other properties returned by the search (e.g., score)
}

const searchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { q } = req.query;

  // Validate query parameter
  if (!q || Array.isArray(q)) {
    return res.status(400).json({ error: "Invalid query parameter." });
  }

  try {
    const searchResults = await client.collections('equipment').documents().search({
      q: q as string,
      query_by: "serial, model, manufacturer, category, assignee.firstName, assignee.lastName, location.stationName",
      sort_by: "_text_match:desc", // Sort by relevance
    });

    // Ensure we always return an array of documents
    const documents: Document[] = searchResults.hits?.map((hit: SearchResponseHit) => ({
      ...hit.document,
    })) || [];

    res.status(200).json(documents);
  } catch (error: unknown) {
    console.error("Error in search API:", error); // Log error details
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default searchHandler;
