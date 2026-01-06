import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";

// Set to false to run production build (no hot reloading)
const dev = process.env.DEV === "true";
const hostname = "hygraph.com";
const port = 443;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./hygraph.com+2-key.pem"),
  cert: fs.readFileSync("./hygraph.com+2.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, () => {
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});
