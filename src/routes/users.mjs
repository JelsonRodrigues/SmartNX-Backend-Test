import { Router } from "express";
import { body, validationResult, query } from "express-validator";
import { models } from "../db/index.mjs";
import calculate_hash_for_plaintext_password from "../utils/password_hasher.mjs"
import authWithJWT from "../middleware/authWithJWT.mjs";
import calculatePaginationPosition from "../utils/calculatePaginationPosition.mjs";

const router = Router();

router.post('/api/v1/user/register', 
  body("username").isString().isLength({min: 6, max: 64}).withMessage("username must be between 6 and 64 characters long"),  
  body("password").isString().isLength({min: 12, max: 128}).withMessage("password must be between 12 and 128 characters long"),
  body("display_name").optional().isString().isLength({min:1, max: 128}).withMessage("display_name must be between 1 and 128 characters long"),
  async (request, response) => {
  const result_of_validation = validationResult(request);
  
  if (!result_of_validation.isEmpty()) {
    return response
      .status(400)
      .send(
        result_of_validation
        .array()
      );
  }
  
  const {username, password, display_name} = request.body;

  const  { User } = models;
  const new_user = User.build({"user_name": username, "display_name": display_name, "password": calculate_hash_for_plaintext_password(password)});  
  try {
    await new_user.save();
  }
  catch (e) {
    return response.status(409).send();
  }

  response.status(201).send("User registered successfully");
});

router.get('/api/v1/user/me', authWithJWT, async (request, response) => {
  const user_id = request.user.user_id;
  const {User} = models;

  const user = await User.findOne({where: {id: user_id, is_active: true}, attributes : ['user_name', 'display_name', 'id']});
  if (!user) {
    return response.status(404).send();
  }

  return response.status(200).send(user);
});

router.patch('/api/v1/user/me', 
  authWithJWT,
  body("display_name").optional().isString().isLength({min:1, max: 128}).withMessage("display_name must be between 1 and 128 characters long"),
  body("password").optional().isString().isLength({min: 12, max: 128}).withMessage("password must be between 12 and 128 characters long"),
  body("username").optional().isString().isLength({min: 6, max: 64}).withMessage("username must be between 6 and 64 characters long"),
    async (request, response) => {
    const result_of_validation = validationResult(request);
    if (!result_of_validation.isEmpty()) {
      return response.status(400).send(result_of_validation.array());
    }
    if (!request.body) {return response.status(400).send();}
    const user_id = request.user.user_id;
    const { User } = models;

    const user = await User.findOne({ where: { id: user_id, is_active: true } });
    if (!user) {
      return response.status(404).send();
    }

    const { display_name, password, username } = request.body || {};

    if (display_name !== undefined) user.display_name = display_name;
    if (password !== undefined) user.password = calculate_hash_for_plaintext_password(password);
    if (username !== undefined) user.user_name = username;

    try {
      await user.save();
      const { id, user_name, display_name, createdAt } = user;
      return response.status(200).send({ id, user_name, display_name, createdAt });
    } catch (e) {
      return response.status(409).send();
    }
  }
);

router.delete('/api/v1/user/me', authWithJWT, async (request, response) => {
  const user_id = request.user.user_id;
  const { User } = models;
  const user = await User.findOne({ where: { id: user_id, is_active: true } });
  if (!user) {
    return response.status(404).send();
  }
  user.is_active = false;
  try {
    await user.save();
    return response.status(200).send();
  } catch (e) {
    return response.status(500).send();
  }
});

router.get('/api/v1/users', 
  authWithJWT, 
  query("page").optional().isNumeric().withMessage("page must be a number").isInt({min:1}).withMessage("page must be >= 1"),
  query("limit").optional().isNumeric().withMessage("limit must be a number").isInt({min:1, max: 50}).withMessage("limt must be between 1 and 50"),
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send(result.array());
    }
    const { User } = models;
    console.log(request.query);
    const page = parseInt(request.query.page || 1);
    const limit = parseInt(request.query.limit || 15);
    const number_of_items = await User.count();
    const pagination = await calculatePaginationPosition(page, limit, number_of_items);
    const start_index = (page - 1) * limit;

    try {
      const items = await User.findAll({
        where: { is_active: true },
        offset: start_index,
        limit: limit,
        attributes: ['id', 'user_name', 'display_name', 'createdAt']
      });

      if (!items) {
        return response.status(404).send();
      }

      return response.status(200).send({ pagination, items });
    } catch (err) {
      return response.status(500).send();
    }
  });

router.get('/api/v1/user/:username', 
  authWithJWT,
  async (request, response) => {
  const { username } = request.params;
  const { User } = models;

  try {
    const user = await User.findOne({ where: { user_name: username, is_active : true} , attributes : ['id', 'user_name', 'display_name', 'createdAt']});
    if (!user) {
      return response.status(404).send();
    }
    return response.status(200).send(user);
  }
  catch (error) {
    return response.status().send();
  }
});

router.get('/api/v1/user/id/:user_id',
  authWithJWT,
  async (request, response) => {
    const { user_id } = request.params;
    const { User } = models;

    try {
      const user = await User.findOne({ where: { id: user_id, is_active: true }, attributes: ['id', 'user_name', 'display_name', 'createdAt'] });
      if (!user) {
        return response.status(404).send();
      }
      return response.status(200).send(user);
    }
    catch (error) {
      return response.status(500).send();
    };
});

export default router;