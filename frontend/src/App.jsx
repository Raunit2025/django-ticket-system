import { useState } from "react";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import StatsDashboard from "./components/StatsDashboard";

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleTicketCreated = () => {
    setRefresh(prev => !prev);
  };

  return (
    <div className="container">
      <h1>Support Ticket System</h1>

      <TicketForm onTicketCreated={handleTicketCreated} />
      <TicketList refresh={refresh} />
      <StatsDashboard refresh={refresh} />
    </div>
  );
}

export default App;
