import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/check-vpn", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    // Fetch IP info from ipapi.co
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const org = data.org || "Unknown";
    const country = data.country_name || "Unknown";

    const vpnKeywords = ["vpn", "proxy", "hosting", "cloud", "aws", "google", "digitalocean", "microsoft", "azure"];
    const isVpn = vpnKeywords.some(k => org.toLowerCase().includes(k));

    res.json({
      ip,
      org,
      country,
      isVpn,
      message: isVpn ? "⚠️ VPN or Proxy Detected" : "✅ Normal connection",
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ VPN Detector API is running. Use /check-vpn to test.");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
