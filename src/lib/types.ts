export interface Milestone {
  id?: string; // Optional since data doesn't always provide it
  status: string;
  timestamp: string | null;
}

export interface Shipment {
  id: string;
  customer: string;
  origin: string;
  destination: string | null;
  milestones: Milestone[];
}
  