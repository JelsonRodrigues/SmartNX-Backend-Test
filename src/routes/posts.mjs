import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, query, validationResult } from "express-validator";
import { models } from "../db/index.mjs";

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
  }
  catch (e) {
    return response.status(409).send();
  }

  response.status(201).send("Post added");
});

router.get("/api/v1/posts", authWithJWT,
  query("page").isNumeric().withMessage("page must be a number").isInt({min:1}).withMessage("page must be >= 1"),
  query("limit").isNumeric().withMessage("limit must be a number").isInt({min:1, max: 50}).withMessage("limt must be between 1 and 50"),
  async (request, response) => {
  const result = validationResult(request);
  if (!result.isEmpty()) {
    return response.status(400).send(result.array());
  }
  
  const page  = parseInt(request.query.page);
  const limit  = parseInt(request.query.limit);

  const start_index = (page - 1) * limit;
  const end_index = page * limit;
  
  const { Post } = models;
  const number_of_posts =  await Post.count();

  const pagination = {}
  if (start_index > 0 && start_index < number_of_posts) {
    pagination.previous = {
      page : page -1,
      limit : limit
    }
  }
  if (end_index < number_of_posts) {
    pagination.next = {
      page : page + 1,
      limit : limit
    }
  }

  Post.findAll({offset : start_index, limit: limit}).then((posts) => {
    if (!posts) {
      return response.send(404);
    }

    response.status(200).send({ pagination, posts });
  })
});

export default router;