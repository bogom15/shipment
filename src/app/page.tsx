"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Shipment } from "@/lib/types";
import { getShipments } from "@/lib/api/getShipments";
import ShipmentList from "@/components/ShipmentList";
import {
  getLatestMilestoneTime,
  hasInconsistentData,
} from "@/lib/utils/shipmentUtils";
import "./globals.css";

const HomePage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterText, setFilterText] = useState("");
  const [sortByMostRecent, setSortByMostRecent] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getShipments();
        setShipments(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? `Failed to load shipment data: ${err.message}`
            : "Failed to load shipment data. Please try refreshing the page.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = shipments;

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter((s) =>
        String(s.customer ?? "")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sortByMostRecent) {
      const withTimes = list.map((s) => ({
        shipment: s,
        latestTime: getLatestMilestoneTime(s),
      }));
      withTimes.sort((a, b) => b.latestTime - a.latestTime);
      list = withTimes.map((item) => item.shipment);
    }

    return list;
  }, [shipments, filterText, sortByMostRecent]);

  const hasAnyInconsistencies = filteredAndSorted.some((s) =>
    hasInconsistentData(s)
  );

  return (
    <main className="app-root">
      <h1 style={{ marginBottom: "0.5rem" }}>Shipment Tracking Dashboard</h1>
      <p className="subtitle">
        Inspect shipments, milestones, and see how we handle messy data.
      </p>
      <section className="controls" style={{ marginBottom: 16 }}>
        <div className="control-group">
          <label htmlFor="filter-input">Filter by customer</label>
          <input
            id="filter-input"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search customer name…"
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={sortByMostRecent}
              onChange={(e) => setSortByMostRecent(e.target.checked)}
            />{" "}
            Sort by most recent milestone
          </label>
        </div>
      </section>
      <section>
        {loading && (
          <div className="placeholder-box skeleton">
            Loading shipments…
          </div>
        )}

        {!loading && error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && hasAnyInconsistencies && (
          <div className="warning" style={{ marginBottom: 12 }}>
            Data incomplete or inconsistent for some shipments. Missing or
            invalid timestamps are handled
          </div>
        )}

        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="placeholder-box">
            No shipments match your current filters.
          </div>
        )}

        {!loading && !error && filteredAndSorted.length > 0 && (
          <ShipmentList shipments={filteredAndSorted} />
        )}
      </section>
    </main>
  );
};

export default HomePage;
