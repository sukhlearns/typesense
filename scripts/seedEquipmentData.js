// scripts/seedEquipmentData.js
import client from "../lib/typesenseClient.js";

const equipmentData = [
  {
    inMaintenance: true,
    decommissioned: false,
    verified: true,
    id: "equipment-HHqKe3iWpt",
    serial: "X0-8022-5598-1-08",
    size: "l",
    modelId: "model-Qc0kbklaOk",
    model: "MULTI-BYTE BOOTS",
    manufacturer: "Tromp, Mayert and Schmidt",
    notes: "Voluptatibus vulgaris abstergo...",
    lastMaintenance: "2024-10-28T23:47:28.608Z",
    manufactured: "2024-10-28T23:47:28.608Z",
    category: "boots",
    assignee: {
      firefighterId: "firefighter-cwrzSRfvrU",
      firstName: "Walter",
      lastName: "Satterfield"
    },
    location: {
      stationId: "station-GoLhNtptvz",
      stationName: "Polk County Fire Department"
    }
  },
  {
    inMaintenance: true,
    decommissioned: false,
    verified: true,
    id: "equipment-2CU05FlIda",
    serial: "X0-575-43672-7-05",
    size: "l",
    modelId: "model-Qc0kbklaOk",
    model: "MULTI-BYTE BOOTS",
    manufacturer: "Tromp, Mayert and Schmidt",
    notes: "Appositus repellendus aut aspernatur acceptus via sodalitas. Studio comes reiciendis subiungo acquiro. Valetudo at consectetur avarus spero vaco carmen testimonium auditor.",
    lastMaintenance: "2024-10-28T23:47:26.016Z",
    manufactured: "2024-10-28T23:47:26.016Z",
    category: "boots",
    assignee: {
      firefighterId: "firefighter-dhYhZ5zk0L",
      firstName: "Kayla",
      lastName: "Turcotte"
    },
    location: {
      stationId: "station-GoLhNtptvz",
      stationName: "Polk County Fire Department"
    }
  },
  //... (rest of the data)
];

async function seedData() {
  try {
    const promises = equipmentData.map((record) =>
      client.collections("equipment").documents().create(record)
    );
    await Promise.all(promises);
    console.log("Sample data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedData();
