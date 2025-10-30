import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, query, param, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";

const router = Router();

router.post("/api/v1/post/create", 
  authWithJWT,
  body("title").isString().isLength({min: 1, max: 64}),
  body("content").isString().isLength({min: 1, max: 255}),
  async (request, response) => {
    const result_of_validation = validationResult(request)
    if (!result_of_validation.isEmpty()) {
    return response
      .status(400)
      .send(
        result_of_validation
        .array()
      );
    }

    const user_id = request.user.user_id;
    const { Post } = models;
    const new_post = Post.build({
      "title": request.body.title,
      "content": request.body.content,
      "user_id" : user_id
    });

  try {
    await new_post.save();
    const { id, title, content, createdAt, last_edited } = new_post;
    return response.status(201).send({ id, title, content, createdAt, last_edited });
  }
  catch (e) {
    return response.status(409).send();
  }

  
});

router.get("/api/v1/posts", authWithJWT,
  query("page").optional().isNumeric().withMessage("page must be a number").isInt({min:1}).withMessage("page must be >= 1"),
  query("limit").optional().isNumeric().withMessage("limit must be a number").isInt({min:1, max: 50}).withMessage("limt must be between 1 and 50"),
  async (request, response) => {
  const result = validationResult(request);
  if (!result.isEmpty()) {
    return response.status(400).send(result.array());
  }
  const { Post } = models;
  const { User } = models;
  const page  = parseInt(request.query.page || 1);
  const limit  = parseInt(request.query.limit || 15);
  const number_of_items =  await Post.count();
  const pagination = await calculatePaginationPosition(page, limit, number_of_items);
  const start_index = (page - 1) * limit;
  try {
    const items = await Post.findAll(
      { where: { is_active: true },
      attributes: ['id', 'title', 'content', 'createdAt', 'last_edited'],
      offset: start_index, limit: limit, 
      include: { model: User, where : { is_active: true}, attributes: ['user_name', 'display_name']}});
    if (!items) {
      return response.send(404);
    }

    return response.status(200).send({ pagination, items });
  } catch (err) {
    return response.status(500).send();
  }
});

router.get("/api/v1/post/:post_id",
  authWithJWT,
  param("post_id").isUUID().notEmpty(),
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send(result.array());
    }

    const post_id = request.params.post_id;
    const { Post } = models;
    const { User } = models;
    try {
      const item = await Post.findOne({
        where: { id: post_id, is_active: true },
        attributes: ['id', 'title', 'content', 'createdAt', 'last_edited'],
        include: { model: User, where: { is_active: true }, attributes: ['user_name', 'display_name'] }
        });
      if (!item) { 
        return response.status(404).send();
      }
      return response.status(200).send(item);
    }
    catch (error) {
      return response.status(500).send();
    }
  }
);

router.patch("/api/v1/post/:id", authWithJWT,
  body("title").optional().isString().isLength({min: 1, max: 64}),
  body("content").optional().isString().isLength({min: 1, max: 255}),
  param("id").isUUID().notEmpty(),
  async (request, response) => {
    const result_of_validation = validationResult(request)
    if (!result_of_validation.isEmpty()) {
      return response
        .status(400)
        .send(result_of_validation.array());
    }

    const post_id = request.params.id;
    const { Post } = models;
    const post = await Post.findOne({ where: { id: post_id, is_active: true } });
    if (!post) {
      return response.status(404).send();
    }

    if (post.user_id !== request.user.user_id) {
      return response.status(403).send();
    }

    if (!request.body) {return response.status(400).send();}

    const { title, content } = request.body || {};
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    post.last_edited = new Date().toISOString().replace('T', ' ').replace('Z', ' +00:00');


    try {
      await post.save();
      const { id, title, content, createdAt, last_edited } = post;
      return response.status(200).send({ id, title, content, createdAt, last_edited });
    } catch (error) {
      console.log(error);
      return response.status(500).send();
    }}
);

router.delete("/api/v1/post/:id", authWithJWT,
  param("id").isUUID().notEmpty(),
  async (request, response) => {
    const result_of_validation = validationResult(request)
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }
    const post_id = request.params.id;
    const { Post } = models;
    const post = await Post.findOne({ where: { id: post_id, is_active: true } });
    if (!post) {
      return response.status(404).send();
    }
    if (post.user_id !== request.user.user_id) {
      return response.status(403).send();
    }
    post.is_active = false;
    try {
      await post.save();
      return response.status(200).send();
    } catch (error) {
      return response.status(500).send();
    }
  });

export default router;