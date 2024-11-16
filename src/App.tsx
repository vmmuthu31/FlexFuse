import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "Components/Home";
import Dashboard from "Components/Dashboard";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
