import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS so frontend can call your API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("✅ VPN Detector API is running. Use /check-vpn to test.");
});

app.get("/check-vpn", async (req, res) => {
  try {
    // Get IP address (priority: query > header > socket)
    let ip =
      req.query.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;

    // Clean "::ffff:" prefix
    if (ip?.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];
    // Prevent local IPs
    if (!ip || ip === "127.0.0.1" || ip === "::1") ip = "8.8.8.8"; // fallback to Google

    // Fetch IP info
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const org = data.org || "Unknown";
    const country = data.country_name || "Unknown";

    const vpnKeywords = [
      "vpn",
      "proxy",
      "hosting",
      "cloud",
      "aws",
      "google",
      "digitalocean",
      "microsoft",
      "azure",
      "ovh",
      "data center"
    ];

    const isVpn = vpnKeywords.some((k) => org.toLowerCase().includes(k));

    res.json({
      ip,
      org,
      country,
      isVpn,
      message: isVpn
        ? "⚠️ VPN or Proxy Detected"
        : "✅ Normal connection",
    });
  } catch (error) {
    console.error("Error in /check-vpn:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
