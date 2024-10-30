// lib/typesenseClient.ts
import Typesense from "typesense";

const client = new Typesense.Client({
  nodes: [
    {
      host: "145.223.20.202", // Replace with your Typesense server IP if different
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: "GbDWY5mKo3MiuTNrIg1TC5XVrQsBQRROhNil5UpTfGw1uYsN", // Replace with your API key
});

export default client;
