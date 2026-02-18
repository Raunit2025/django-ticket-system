import { useEffect, useState } from "react";
import api from "../api";

function TicketList({ refresh }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: ""
  });

  const categories = ["billing", "technical", "account", "general"];
  const priorities = ["low", "medium", "high", "critical"];
  const statuses = ["open", "in_progress", "resolved", "closed"];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const params = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key]) params[key] = filters[key];
        });

        const res = await api.get("", { params });
        setTickets(res.data);
      } catch {
        console.error("Failed to fetch tickets");
      }
    };

    fetchTickets();
  }, [refresh, filters]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`${id}/`, { status: newStatus });

      const res = await api.get("", { params: filters });
      setTickets(res.data);
    } catch {
      console.error("Failed to update status");
    }
  };

  return (
    <div>
      <h2>Tickets</h2>

      <div className="filters">
        <select onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          {priorities.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <div>
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <h3>{ticket.title}</h3>
            <p>{ticket.description.slice(0, 100)}...</p>
            <p>Category: {ticket.category}</p>
            <p>Priority: {ticket.priority}</p>
            <p>Status: {ticket.status}</p>
            <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>

            <select
              value={ticket.status}
              onChange={(e) => updateStatus(ticket.id, e.target.value)}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketList;
