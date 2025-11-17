"use client";

import React, { useState } from "react";
import { Shipment } from "@/lib/types";
import {
  formatDate,
  getLatestMilestone,
  getMilestonesArray,
  hasInconsistentData,
  isValidDate,
  sortMilestonesChronologically,
} from "@/lib/utils/shipmentUtils";

interface Props {
  shipments: Shipment[];
}

const ShipmentList: React.FC<Props> = ({ shipments }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="shipment-list">
      {shipments.map((shipment) => {
        const latest = getLatestMilestone(shipment);
        const inconsistent = hasInconsistentData(shipment);
        const milestones = sortMilestonesChronologically(
          getMilestonesArray(shipment)
        );
        const isExpanded = expandedId === shipment.id;

        return (
          <div key={shipment.id} className="shipment-card">
            {/* Top row: summary */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} shipment ${shipment.id}`}
              className="shipment-header"
              onClick={() => toggleExpand(shipment.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpand(shipment.id);
                }
              }}
            >
              <div>
                <div>
                  <strong>ID:</strong> {shipment.id}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {shipment.customer ?? "(unknown customer)"}
                </div>
                <div>
                  <strong>Route:</strong>{" "}
                  {shipment.origin ?? "(unknown)"} →{" "}
                  {shipment.destination ?? "(unknown)"}
                </div>
              </div>

              <div className="shipment-meta">
                <div>
                  <strong>Latest milestone:</strong>{" "}
                  {latest?.status ?? "N/A"}
                </div>
                <div className="shipment-timestamp">
                  {latest?.timestamp ? formatDate(latest.timestamp) : "N/A"}
                </div>
              </div>
            </div>

            {/* Row-level warning */}
            {inconsistent && (
              <div className="warning shipment-warning">
                Data incomplete or inconsistent for this shipment.
              </div>
            )}

            {/* Expanded milestone list */}
            {isExpanded && (
              <div className="milestone-list">
                <strong>Milestones</strong>
                {milestones.length === 0 ? (
                  <div className="placeholder-box milestone-empty">
                    No milestones available.
                  </div>
                ) : (
                  <ul className="milestone-items">
                    {milestones.map((m, index) => (
                      <li key={`${shipment.id}-milestone-${index}-${m.status}`} className="milestone-item">
                        <div>
                          <strong>{m.status}</strong>{" "}
                          <span className="milestone-timestamp">
                            – {formatDate(m.timestamp ?? null)}
                          </span>
                        </div>
                        {(!m.timestamp ||
                          !isValidDate(m.timestamp ?? null)) && (
                          <div className="milestone-invalid">
                            This milestone has incomplete or invalid
                            timestamp data.
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentList;
