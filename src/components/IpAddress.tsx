import { useEffect, useState } from "react";

export default function IpAddress() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchIp() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIp(data.ip);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch IP");
      } finally {
        setLoading(false);
      }
    }

    fetchIp();
  }, []);

  return (
    <div className="flex items-center">
      <p>IP Address:</p>
      {loading && <p className="text-muted">Fetching IP address....</p>}
      {error && <p className="text-red-500">{error}</p>}
      {ip && <p className="font-bold">{ip}</p>}
    </div>
  );
}
