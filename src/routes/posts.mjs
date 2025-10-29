import { Router } from "express";
import authWithJWT from "../middleware/authWithJWT.mjs";
import { body, validationResult } from "express-validator";
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

export default router;