import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, query, param, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";

const router = Router();

router.post(
  "/api/v1/post/:postId/comment",
  authWithJWT,
  param("postId").isUUID().withMessage("postId must be a valid UUID"),
  body("content")
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("content must be between 1 and 255 characters long"),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }

    const userId = request.user.userId;
    const { Comment } = models;
    const newComment = Comment.build({
      content: request.body.content,
      userId: userId,
      postId: request.params.postId,
    });

    try {
      await newComment.save();
      const { id, content, postId, userId, createdAt, lastEdited } = newComment;
      return response
        .status(201)
        .send({ id, content, postId, userId, createdAt, lastEdited });
    } catch (e) {
      console.error(e);
      return response.status(500).send();
    }
  }
);

router.get(
  "/api/v1/comments/post/:postId/",
  authWithJWT,
  param("postId").isUUID().withMessage("postId must be a valid UUID"),
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
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }
    const { Comment, User } = models;
    const postId = request.params.postId;

    const page = parseInt(request.query.page || 1);
    const limit = parseInt(request.query.limit || 15);
    const numberOfItems = await Comment.count({
      where: { postId, isActive: true },
    });
    const pagination = await calculatePaginationPosition(
      page,
      limit,
      numberOfItems
    );
    const startIndex = (page - 1) * limit;

    try {
      const comments = await Comment.findAll({
        where: { postId: postId, isActive: true },
        offset: startIndex,
        limit: limit,
        attributes: [
          "id",
          "content",
          "postId",
          "userId",
          "createdAt",
          "lastEdited",
        ],
        include: [
          {
            model: User,
            attributes: ["userName", "displayName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!comments) {
        return response.status(404).send();
      }
      return response.status(200).send({ pagination, comments });
    } catch (e) {
      return response.status(500).send();
    }
  }
);

// - Delete comment
router.delete(
  "/api/v1/comment/:commentId",
  authWithJWT,
  param("commentId").isUUID().withMessage("commentId must be a valid UUID"),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }

    const { Comment } = models;
    const userId = request.user.userId;
    const { commentId } = request.params;
    try {
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          userId: userId,
          isActive: true,
        },
      });

      if (!comment) {
        return response.status(404).send({ message: "Comment not found" });
      }

      comment.isActive = false;
      await comment.save();
      return response.status(200).send();
    } catch (e) {
      return response.status(500).send();
    }
  }
);

router.patch(
  "/api/v1/comment/:commentId",
  authWithJWT,
  param("commentId").isUUID().withMessage("commentId must be a valid UUID"),
  body("content")
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("content must be between 1 and 255 characters long"),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }

    const { commentId } = request.params;
    const { content } = request.body;
    const userIdFromToken = request.user.userId;

    const { Comment } = models;

    try {
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          userId: userIdFromToken,
          isActive: true,
        },
      });

      if (!comment) {
        return response.status(404).send({ message: "Comment not found" });
      }

      comment.content = content;
      comment.lastEdited = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      await comment.save();
      const { id, postId, userId, createdAt, lastEdited } = comment;
      return response
        .status(200)
        .send({ id, content, postId, userId, createdAt, lastEdited });
    } catch (e) {
      return response.status(500).send();
    }
  }
);

// Get a comment by ID
router.get(
  "/api/v1/comment/:commentId",
  authWithJWT,
  param("commentId").isUUID().withMessage("commentId must be a valid UUID"),
  async (request, response) => {
    const resultOfValidation = validationResult(request);
    if (!resultOfValidation.isEmpty()) {
      return response.status(400).send(resultOfValidation.array());
    }
    const { Comment, User } = models;
    const commentId = request.params.commentId;
    try {
      const comment = await Comment.findOne({
        where: { isActive: true, id: commentId },
        attributes: [
          "id",
          "content",
          "postId",
          "userId",
          "createdAt",
          "lastEdited",
        ],
        include: [
          {
            model: User,
            attributes: ["userName", "displayName"],
          },
        ],
      });
      if (!comment) {
        return response.status(404).send();
      }
      return response.status(200).send(comment);
    } catch (e) {
      return response.status(500).send();
    }
  }
);

export default router;
