import { Shipment, Milestone } from "../types";

export const isValidDate = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};


export const getMilestonesArray = (shipment: Shipment): Milestone[] => {
  return Array.isArray(shipment.milestones) ? shipment.milestones : [];
};


export const hasInconsistentData = (shipment: Shipment): boolean => {
  const { id, customer, origin, destination } = shipment;
  const milestones = getMilestonesArray(shipment);

  if (!id || !customer || !origin || !destination) return true;
  if (milestones.length === 0) return true;

  return milestones.some(
    (m) => !m.timestamp || !isValidDate(m.timestamp ?? null)
  );
};


export const getTimestamp = (
  timestamp: string | null | undefined
): number | null => {
  if (!timestamp || !isValidDate(timestamp)) return null;
  return new Date(timestamp).getTime();
};


export const formatDate = (value: string | null | undefined): string => {
  if (!value) return "No timestamp";
  if (!isValidDate(value)) return "Invalid timestamp";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};


export const getLatestMilestone = (shipment: Shipment): Milestone | null => {
  const milestones = getMilestonesArray(shipment);
  if (milestones.length === 0) return null;

  const valid = milestones.filter((m) => isValidDate(m.timestamp ?? null));
  if (valid.length === 0) return null;

  return valid.reduce((latest, current) => {
    const latestTime = getTimestamp(latest.timestamp);
    const currentTime = getTimestamp(current.timestamp);
    if (!latestTime || !currentTime) return latest;
    return currentTime > latestTime ? current : latest;
  });
};


export const getLatestMilestoneTime = (shipment: Shipment): number => {
  const milestones = getMilestonesArray(shipment);
  const times = milestones
    .map((m) => getTimestamp(m.timestamp ?? null))
    .filter((t): t is number => t !== null);

  if (times.length === 0) return 0;
  return Math.max(...times);
};

export const sortMilestonesChronologically = (milestones: Milestone[]) => {
  return [...milestones].sort((a, b) => {
    const aTime = getTimestamp(a.timestamp ?? null) ?? Number.POSITIVE_INFINITY;
    const bTime = getTimestamp(b.timestamp ?? null) ?? Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
};

