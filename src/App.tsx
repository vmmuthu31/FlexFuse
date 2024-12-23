import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "Components/Home";
import Dashboard from "Components/Dashboard";
import Subscriptions from "Components/Subscriptions";
import Subscription from "Components/Subscription";
import CreateSubscription from "Components/CreateSubscription";
import CreateExpenses from "Components/CreateExpenses";
import CreateGroup from "Components/CreateGroup";
import Redeem from "Components/Redeem";
import CrossChainTransfer from "Components/CrossChain";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CreateSubscription" element={<CreateSubscription />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Subscriptions" element={<Subscriptions />} />
          <Route path="/Subscriptions/:id" element={<Subscription />} />
          <Route path="/CreateExpenses" element={<CreateExpenses />} />
          <Route path="/CreateGroup" element={<CreateGroup />} />
          <Route path="/Redeem" element={<Redeem />} />
          <Route path="/crosschain" element={<CrossChainTransfer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
