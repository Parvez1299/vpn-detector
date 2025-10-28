import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/check-vpn", async (req, res) => {
  try {
    let ip = req.query.ip || req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    if (ip.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];

    const apiKey = process.env.VPNAPI_KEY;
    const url = `https://vpnapi.io/api/${ip}?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      ip: data.ip,
      country: data.location?.country,
      org: data.network?.autonomous_system_organization,
      isVpn: data.security?.vpn,
      isProxy: data.security?.proxy,
      isTor: data.security?.tor,
      message: data.security?.vpn || data.security?.proxy || data.security?.tor
        ? "⚠️ VPN or Proxy Detected"
        : "✅ Normal connection"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ VPN Detector API (vpnapi.io) is running. Use /check-vpn");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
