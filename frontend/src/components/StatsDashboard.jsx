import { useEffect, useState } from "react";
import api from "../api";

function StatsDashboard({ refresh }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("stats/");
        setStats(res.data);
      } catch {
        console.error("Failed to fetch stats");
      }
    };

    fetchStats();
  }, [refresh]);

  if (!stats) return <p>Loading stats...</p>;

  return (
    <div className="stats-box">
      <h2>Statistics</h2>

      <p><strong>Total Tickets:</strong> {stats.total_tickets}</p>
      <p><strong>Open Tickets:</strong> {stats.open_tickets}</p>
      <p><strong>Average Tickets Per Day:</strong> {stats.avg_tickets_per_day}</p>

      <h3>Priority Breakdown</h3>
      <ul>
        {Object.entries(stats.priority_breakdown).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>

      <h3>Category Breakdown</h3>
      <ul>
        {Object.entries(stats.category_breakdown).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default StatsDashboard;
