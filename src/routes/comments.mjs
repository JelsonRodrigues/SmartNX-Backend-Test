import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, query, param, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";

const router = Router();

router.post(
  "/api/v1/post/:post_id/comment",
  authWithJWT,
  param("post_id").isUUID().withMessage("post_id must be a valid UUID"),
  body("content")
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("content must be between 1 and 255 characters long"),
  async (request, response) => {
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }

    const user_id = request.user.user_id;
    const { Comment } = models;
    const new_comment = Comment.build({
      content: request.body.content,
      user_id: user_id,
      post_id: request.params.post_id,
    });

    try {
      await new_comment.save();
      const { id, content, post_id, user_id, createdAt, last_edited } =
        new_comment;
      return response
        .status(201)
        .send({ id, content, post_id, user_id, createdAt, last_edited });
    } catch (e) {
      console.error(e);
      return response.status(500).send();
    }
  }
);

router.get(
  "/api/v1/comments/post/:post_id/",
  authWithJWT,
  param("post_id").isUUID().withMessage("post_id must be a valid UUID"),
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
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }
    const { Comment, User } = models;
    const post_id = request.params.post_id;

    const page = parseInt(request.query.page || 1);
    const limit = parseInt(request.query.limit || 15);
    const number_of_items = await Comment.count({
      where: { post_id, is_active: true },
    });
    const pagination = await calculatePaginationPosition(
      page,
      limit,
      number_of_items
    );
    const start_index = (page - 1) * limit;

    try {
      const comments = await Comment.findAll({
        where: { post_id: post_id, is_active: true },
        offset: start_index,
        limit: limit,
        attributes: [
          "id",
          "content",
          "post_id",
          "user_id",
          "createdAt",
          "last_edited",
        ],
        include: [
          {
            model: User,
            attributes: ["user_name", "display_name"],
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
  "/api/v1/comment/:comment_id",
  authWithJWT,
  param("comment_id").isUUID().withMessage("comment_id must be a valid UUID"),
  async (request, response) => {
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }

    const { Comment } = models;
    const user_id = request.user.user_id;
    const { comment_id } = request.params;
    try {
      const comment = await Comment.findOne({
        where: {
          id: comment_id,
          user_id: user_id,
          is_active: true,
        },
      });

      if (!comment) {
        return response.status(404).send({ message: "Comment not found" });
      }

      comment.is_active = false;
      await comment.save();
      return response.status(200).send();
    } catch (e) {
      return response.status(500).send();
    }
  }
);

router.patch(
  "/api/v1/comment/:comment_id",
  authWithJWT,
  param("comment_id").isUUID().withMessage("comment_id must be a valid UUID"),
  body("content")
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("content must be between 1 and 255 characters long"),
  async (request, response) => {
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }

    const { comment_id } = request.params;
    const { content } = request.body;
    const user_id_from_token = request.user.user_id;

    const { Comment } = models;

    try {
      const comment = await Comment.findOne({
        where: {
          id: comment_id,
          user_id: user_id_from_token,
          is_active: true,
        },
      });

      if (!comment) {
        return response.status(404).send({ message: "Comment not found" });
      }

      comment.content = content;
      comment.last_edited = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      await comment.save();
      const { id, post_id, user_id, createdAt, last_edited } = comment;
      return response
        .status(200)
        .send({ id, content, post_id, user_id, createdAt, last_edited });
    } catch (e) {
      return response.status(500).send();
    }
  }
);

// Get a comment by ID
router.get(
  "/api/v1/comment/:comment_id",
  authWithJWT,
  param("comment_id").isUUID().withMessage("comment_id must be a valid UUID"),
  async (request, response) => {
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }
    const { Comment, User } = models;
    const comment_id = request.params.comment_id;
    try {
      const comment = await Comment.findOne({
        where: { is_active: true, id: comment_id },
        attributes: [
          "id",
          "content",
          "post_id",
          "user_id",
          "createdAt",
          "last_edited",
        ],
        include: [
          {
            model: User,
            attributes: ["user_name", "display_name"],
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
