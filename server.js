// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Allow frontend requests from any domain (CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Detect VPN route
app.get("/check-vpn", async (req, res) => {
  try {
    // Get IP address (from request or query)
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (ip.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];

    // If ?ip= is given in URL (optional, for testing)
    if (req.query.ip) ip = req.query.ip;

    // Use free public IP info API
    const apiUrl = `https://ipapi.co/${ip}/json/`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Heuristic check
    const org = (data.org || "").toLowerCase();
    const vpnKeywords = ["vpn", "hosting", "data center", "amazon", "aws", "google", "microsoft", "ovh", "digitalocean"];
    const isVpn = vpnKeywords.some(word => org.includes(word));

    res.json({
      ip: data.ip,
      org: data.org,
      country: data.country_name,
      isVpn: isVpn,
      message: isVpn ? "⚠️ Possible VPN/Hosting detected" : "✅ Normal connection",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
