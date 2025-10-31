import jwt from "jsonwebtoken";
import { models } from "../db/index.mjs";

export default function authWithJWT(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return response.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return response.sendStatus(403);
    }

    const { User } = models;
    const userActiveOnDb = await User.findOne({
      where: { id: user.userId, isActive: true },
    });
    if (!userActiveOnDb) {
      return response.sendStatus(403);
    }

    request.user = user;
    next();
  });
}
