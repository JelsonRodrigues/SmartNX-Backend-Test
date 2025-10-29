import { response, Router } from "express";
import { body, validationResult } from "express-validator";
import { models } from "../db/index.mjs";
import calculate_hash_for_plaintext_password from "../utils/password_hasher.mjs"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/api/v1/auth', 
  body("username").isString().isLength({min: 6, max: 64}).withMessage("username must be between 6 and 64 characters long"),  
  body("password").isString().isLength({min: 12, max: 128}).withMessage("password must be between 12 and 128 characters long"),
  (request, response) => {
    const result_of_validation = validationResult(request);
    
    if (!result_of_validation.isEmpty()) {
      return response
        .status(400)
        .send(
          result_of_validation
          .array()
        );
    }

    const {username, password} = request.body;
    const  { User } = models;
    User.findOne({where: {user_name: username}}).then((user) => {
      if (!user) {
        return response.status(401).send("Invalid username or password");
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return response.status(401).send("Invalid username or password");
      }

      const user_jwt_token = jwt.sign(
        { user_id: user.id, user_name: user.user_name },
        process.env.JWT_SECRET, { expiresIn: '1h' })
      response.status(200).send({ message: "Authentication successful", token: user_jwt_token });
    });
});

export default router;