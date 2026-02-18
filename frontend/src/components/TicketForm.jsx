import { useState } from "react";
import api from "../api";

function TicketForm({ onTicketCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = ["billing", "technical", "account", "general"];
  const priorities = ["low", "medium", "high", "critical"];

  const handleClassify = async () => {
    if (!description) return;

    try {
      setLoading(true);
      const res = await api.post("classify/", { description });

      if (res.data.suggested_category) {
        setCategory(res.data.suggested_category);
      }

      if (res.data.suggested_priority) {
        setPriority(res.data.suggested_priority);
      }

    } catch {
      console.error("Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("", {
        title,
        description,
        category,
        priority
      });

      onTicketCreated(res.data);

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");

    } catch {
      console.error("Ticket creation failed");
    }
  };

  return (
    <div>
      <h2>Create Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            maxLength={200}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <textarea
            placeholder="Description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleClassify}
          />
          {loading && <p>Analyzing...</p>}
        </div>

        <div>
          <select
            value={category}
            required
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priority}
            required
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">Select Priority</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default TicketForm;
