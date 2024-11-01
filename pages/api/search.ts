// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/typesenseClient';

interface Document {
  id: string;
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
  [key: string]: any;
}

interface SearchResponseHit {
  document: Document;
}

const searchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { q, page = 1, pageSize = 10 } = req.query;

  try {
    const searchParams = {
      q: q && q.trim() !== "" ? (q as string) : "*",
      query_by: "serial, model, manufacturer, category, assignee.firstName, assignee.lastName, location.stationName",
      page: parseInt(page as string, 10),
      per_page: parseInt(pageSize as string, 10),
    };

    const searchResults = await client.collections('equipment').documents().search(searchParams);

    const documents = searchResults.hits?.map((hit: SearchResponseHit) => hit.document) || [];
    const totalResults = searchResults.found || 0;

    res.status(200).json({ documents, totalResults });
  } catch (error: unknown) {
    console.error("Error in search API:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export default searchHandler;
