import express from "express";
import routes from "./routes/index.mjs";
import dotenv from "dotenv";
import { initDB } from "./db/index.mjs";

// Load environment variables from .env file
dotenv.config();

const server = express();

server.use(express.json());
server.use(routes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDB();
});

server.get("/", (request, response) => {
  return response.status(200).send("Hello World");
});
