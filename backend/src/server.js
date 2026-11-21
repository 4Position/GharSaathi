const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");

const server = app.listen(env.port, () => {
  console.log(`GharSaathi API listening on http://localhost:${env.port}`);
});

server.on("error", (error) => {
  console.error(`Unable to start API server: ${error.message}`);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
