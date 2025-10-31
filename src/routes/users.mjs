import { Router } from "express";
import { body, query, param } from "express-validator";
import { models } from "../db/index.mjs";
import calculateHashForPlaintextPassword from "../utils/passwordHasher.mjs";
import authWithJWT from "../middleware/authWithJWT.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";
import doValidationOfRequest from "../middleware/doValidationOfRequest.mjs";

const router = Router();

router.post(
  "/api/v1/user/register",
  body("username")
    .isString()
    .isLength({ min: 6, max: 64 })
    .withMessage("username must be between 6 and 64 characters long"),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .withMessage("password must be between 12 and 128 characters long"),
  body("displayName")
    .optional()
    .isString()
    .isLength({ min: 1, max: 128 })
    .withMessage("displayName must be between 1 and 128 characters long"),
  doValidationOfRequest,
  async (request, response) => {
    const { username, password, displayName } = request.body;

    const { User } = models;
    const newUser = User.build({
      userName: username,
      displayName: displayName,
      password: calculateHashForPlaintextPassword(password),
    });
    try {
      await newUser.save();
    } catch (e) {
      return response.status(409).send();
    }

    response.status(201).send("User registered successfully");
  }
);

router.get("/api/v1/user/me", authWithJWT, async (request, response) => {
  const userId = request.user.userId;
  const { User } = models;

  const user = await User.findOne({
    where: { id: userId, isActive: true },
    attributes: ["userName", "displayName", "id"],
  });
  if (!user) {
    return response.status(404).send();
  }

  return response.status(200).send(user);
});

router.patch(
  "/api/v1/user/me",
  authWithJWT,
  body("displayName")
    .optional()
    .isString()
    .isLength({ min: 1, max: 128 })
    .withMessage("displayName must be between 1 and 128 characters long"),
  body("password")
    .optional()
    .isString()
    .isLength({ min: 12, max: 128 })
    .withMessage("password must be between 12 and 128 characters long"),
  body("username")
    .optional()
    .isString()
    .isLength({ min: 6, max: 64 })
    .withMessage("username must be between 6 and 64 characters long"),
  doValidationOfRequest,
  async (request, response) => {
    if (!request.body) {
      return response.status(400).send();
    }
    const userId = request.user.userId;
    const { User } = models;

    const user = await User.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) {
      return response.status(404).send();
    }

    const { displayName, password, username } = request.body || {};

    if (displayName !== undefined) user.displayName = displayName;
    if (password !== undefined)
      user.password = calculateHashForPlaintextPassword(password);
    if (username !== undefined) user.userName = username;

    try {
      await user.save();
      const { id, userName, displayName, createdAt } = user;
      return response
        .status(200)
        .send({ id, userName, displayName, createdAt });
    } catch (e) {
      return response.status(409).send();
    }
  }
);

router.delete("/api/v1/user/me", authWithJWT, async (request, response) => {
  const userId = request.user.userId;
  const { User } = models;
  const user = await User.findOne({ where: { id: userId, isActive: true } });
  if (!user) {
    return response.status(404).send();
  }
  user.isActive = false;
  try {
    await user.save();
    return response.status(200).send();
  } catch (e) {
    return response.status(500).send();
  }
});

router.get(
  "/api/v1/users",
  authWithJWT,
  query("page")
    .optional()
    .isNumeric()
    .withMessage("page must be a number")
    .isInt({ min: 1 })
    .withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isNumeric()
    .withMessage("limit must be a number")
    .isInt({ min: 1, max: 50 })
    .withMessage("limt must be between 1 and 50"),
  doValidationOfRequest,
  async (request, response) => {
    const { User } = models;
    console.log(request.query);
    const page = parseInt(request.query.page || 1);
    const limit = parseInt(request.query.limit || 15);
    const numberOfItems = await User.count();
    const pagination = await calculatePaginationPosition(
      page,
      limit,
      numberOfItems
    );
    const startIndex = (page - 1) * limit;

    try {
      const items = await User.findAll({
        where: { isActive: true },
        offset: startIndex,
        limit: limit,
        attributes: ["id", "userName", "displayName", "createdAt"],
      });

      if (!items) {
        return response.status(404).send();
      }

      return response.status(200).send({ pagination, items });
    } catch (err) {
      return response.status(500).send();
    }
  }
);

router.get(
  "/api/v1/user/:username",
  authWithJWT,
  param("username").isString().isLength({ min: 6, max: 64 }),
  doValidationOfRequest,
  async (request, response) => {
    const { username } = request.params;
    const { User } = models;

    try {
      const user = await User.findOne({
        where: { userName: username, isActive: true },
        attributes: ["id", "userName", "displayName", "createdAt"],
      });
      if (!user) {
        return response.status(404).send();
      }
      return response.status(200).send(user);
    } catch (error) {
      return response.status(500).send();
    }
  }
);

router.get(
  "/api/v1/user/id/:userId",
  authWithJWT,
  param("userId").isUUID().withMessage("userId must be a valid UUID"),
  doValidationOfRequest,
  async (request, response) => {
    const { userId } = request.params;
    const { User } = models;

    try {
      const user = await User.findOne({
        where: { id: userId, isActive: true },
        attributes: ["id", "userName", "displayName", "createdAt"],
      });
      if (!user) {
        return response.status(404).send();
      }
      return response.status(200).send(user);
    } catch (error) {
      return response.status(500).send();
    }
  }
);

export default router;
