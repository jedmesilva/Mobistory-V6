const http = require("http");

const PROXY_PORT = parseInt(process.env.PROXY_PORT || "5000", 10);
const METRO_PORT = parseInt(process.env.METRO_PORT || "8081", 10);

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

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`Web proxy: localhost:${PROXY_PORT} → localhost:${METRO_PORT}`);
});
