import express from 'express';
import routes from './routes/index.mjs';
import sequelize from './db/db.mjs';

const server = express();

server.use(express.json());
server.use(routes);

const PORT = process.env.PORT || 3000;

server.listen(PORT);

server.get("/", (request, response) => {
  return response.status(200).send("Hello World");
})

