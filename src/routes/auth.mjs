import { response, Router } from "express";
import { body, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doValidationOfRequest from "../middleware/doValidationOfRequest.mjs";

const router = Router();

router.post(
  "/api/v1/auth",
  body("username")
    .isString()
    .isLength({ min: 6, max: 64 })
    .withMessage("username must be between 6 and 64 characters long"),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .withMessage("password must be between 12 and 128 characters long"),
  doValidationOfRequest,
  async (request, response) => {
    const { username, password } = request.body;
    const { User } = models;
    const user = await User.findOne({
      where: { userName: username, isActive: true },
    });

    if (!user) {
      return response.status(401).send("Invalid username or password");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return response.status(401).send("Invalid username or password");
    }

    const userJwtToken = jwt.sign(
      { userId: user.id, userName: user.userName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return response
      .status(200)
      .send({ message: "Authentication successful", token: userJwtToken });
  }
);

export default router;
