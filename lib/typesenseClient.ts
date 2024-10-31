// lib/typesenseClient.ts
import Typesense from "typesense";

// Ensure process.env is loaded (if necessary for your environment)
if (!process.env.TYPESENSE_API_KEY) {
  throw new Error("Missing TYPESENSE_API_KEY in .env.local");
}

const client = new Typesense.Client({
  nodes: [
    {
      host: "145.223.20.202", // Replace with your Typesense server IP if different
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY, // Use the API key from .env.local
});

export default client;
