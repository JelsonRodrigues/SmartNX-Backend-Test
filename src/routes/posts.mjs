import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, query, param, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";

const router = Router();

router.post(
  "/api/v1/post/create",
  authWithJWT,
  body("title").isString().isLength({ min: 1, max: 64 }),
  body("content").isString().isLength({ min: 1, max: 255 }),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }

    const userId = request.user.userId;
    const { Post } = models;
    const newPost = Post.build({
      title: request.body.title,
      content: request.body.content,
      userId: userId,
    });

    try {
      await newPost.save();
      const { id, title, content, createdAt, lastEdited } = newPost;
      return response
        .status(201)
        .send({ id, title, content, createdAt, lastEdited });
    } catch (e) {
      return response.status(409).send();
    }
  }
);

router.get(
  "/api/v1/posts",
  authWithJWT,
  param("userId").optional().isUUID().notEmpty(),
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
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send(result.array());
    }
    const { Post } = models;
    const { User } = models;
    const userId = request.query.userId;
    const page = parseInt(request.query.page || 1);
    const limit = parseInt(request.query.limit || 15);
    const numberOfItems = await Post.count({
      where: { isActive: true, ...(userId ? { userId: userId } : {}) },
    });
    const pagination = await calculatePaginationPosition(
      page,
      limit,
      numberOfItems
    );
    const startIndex = (page - 1) * limit;
    try {
      const items = await Post.findAll({
        where: { isActive: true, ...(userId ? { userId: userId } : {}) },
        attributes: ["id", "title", "content", "createdAt", "lastEdited"],
        offset: startIndex,
        limit: limit,
        include: {
          model: User,
          where: { isActive: true },
          attributes: ["userName", "displayName"],
        },
      });
      if (!items) {
        return response.send(404);
      }

      return response.status(200).send({ pagination, items });
    } catch (err) {
      return response.status(500).send();
    }
  }
);

router.get(
  "/api/v1/post/:postId",
  authWithJWT,
  param("postId").isUUID().notEmpty(),
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send(result.array());
    }

    const postId = request.params.postId;
    const { Post } = models;
    const { User } = models;
    try {
      const item = await Post.findOne({
        where: { id: postId, isActive: true },
        attributes: ["id", "title", "content", "createdAt", "lastEdited"],
        include: {
          model: User,
          where: { isActive: true },
          attributes: ["userName", "displayName"],
        },
      });
      if (!item) {
        return response.status(404).send();
      }
      return response.status(200).send(item);
    } catch (error) {
      return response.status(500).send();
    }
  }
);

router.patch(
  "/api/v1/post/:id",
  authWithJWT,
  body("title").optional().isString().isLength({ min: 1, max: 64 }),
  body("content").optional().isString().isLength({ min: 1, max: 255 }),
  param("id").isUUID().notEmpty(),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }

    const postId = request.params.id;
    const { Post } = models;
    const post = await Post.findOne({
      where: { id: postId, isActive: true },
    });
    if (!post) {
      return response.status(404).send();
    }

    if (post.userId !== request.user.userId) {
      return response.status(403).send();
    }

    if (!request.body) {
      return response.status(400).send();
    }

    const { title, content } = request.body || {};
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    post.lastEdited = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", " +00:00");

    try {
      await post.save();
      const { id, title, content, createdAt, lastEdited } = post;
      return response
        .status(200)
        .send({ id, title, content, createdAt, lastEdited });
    } catch (error) {
      console.log(error);
      return response.status(500).send();
    }
  }
);

router.delete(
  "/api/v1/post/:id",
  authWithJWT,
  param("id").isUUID().notEmpty(),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }
    const postId = request.params.id;
    const { Post } = models;
    const post = await Post.findOne({
      where: { id: postId, isActive: true },
    });
    if (!post) {
      return response.status(404).send();
    }
    if (post.userId !== request.user.userId) {
      return response.status(403).send();
    }
    post.isActive = false;
    try {
      await post.save();
      return response.status(200).send();
    } catch (error) {
      return response.status(500).send();
    }
  }
);

export default router;
