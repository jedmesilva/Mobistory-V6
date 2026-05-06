const http = require("http");

const METRO_PORT = parseInt(process.env.METRO_PORT || "8081", 10);

function createProxy(proxyPort) {
  const server = http.createServer((req, res) => {
    const options = {
      hostname: "localhost",
      port: METRO_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxy.on("error", (err) => {
      res.writeHead(502);
      res.end(`Proxy error: ${err.message}`);
    });

    req.pipe(proxy);
  });

  server.listen(proxyPort, "0.0.0.0", () => {
    console.log(`Web proxy: localhost:${proxyPort} → localhost:${METRO_PORT}`);
  });
}

// Port 5000: webview (browser preview)
createProxy(5000);

// Port 18115: Expo Go on device (REPLIT_EXPO_DEV_DOMAIN routes here)
createProxy(18115);
