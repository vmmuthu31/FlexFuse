import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "Components/Navbar";

function App() {
  return (
    <div className="App">
      <Navbar />
      <ToastContainer />
    </div>
  );
}

export default App;
