// scripts/createEquipmentCollection.js
import client from "../lib/typesenseClient.js";

async function createCollection() {
  try {
    const collectionSchema = {
      name: "equipment",
      fields: [
        { name: "id", type: "string" },
        { name: "serial", type: "string" },
        { name: "size", type: "string" },
        { name: "modelId", type: "string" },
        { name: "model", type: "string" },
        { name: "manufacturer", type: "string" },
        { name: "notes", type: "string" },
        { name: "lastMaintenance", type: "string", facet: true },
        { name: "manufactured", type: "string", facet: true },
        { name: "category", type: "string", facet: true },
        { name: "inMaintenance", type: "bool" },
        { name: "decommissioned", type: "bool" },
        { name: "verified", type: "bool" },
        { name: "assignee.firefighterId", type: "string" },
        { name: "assignee.firstName", type: "string" },
        { name: "assignee.lastName", type: "string" },
        { name: "location.stationId", type: "string" },
        { name: "location.stationName", type: "string" }
      ],
    };

    const response = await client.collections().create(collectionSchema);
    console.log("Collection created:", response);
  } catch (error) {
    console.error("Error creating collection:", error);
  }
}

createCollection();
