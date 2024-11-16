import Navbar from "./Navbar";

function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <div>
          <p>Simplify Multi-Chain Subscriptions and Group Payments</p>
          <p>
            Manage group expenses and multi-chain subscriptions seamlessly with
            Chainiacs, powered by Kinto's secure and compliant infrastructure.
          </p>
          <div>
            <p>Get Started</p>
            <p>Learn More</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
