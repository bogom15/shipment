import { Shipment } from "../types";
import data from "../../data/shipments.json";

// Simulated async API call with slight delay and 10% error rate.
export async function getShipments(): Promise<Shipment[]> {
  return new Promise((resolve, reject) => {
    const delay = 400 + Math.random() * 800; // 400–1200ms
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error("Failed to load shipment data"));
      } else {
        resolve(data as Shipment[]);
      }
    }, delay);
  });
}
