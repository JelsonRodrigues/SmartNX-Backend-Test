import { response, Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../db/User.mjs"
import calculate_hash_for_plaintext_password from "../utils/password_hasher.mjs"

const router = Router();

router.post('/api/v1/register', 
  body("username").isString().isLength({min: 6, max: 64}).withMessage("username must be between 6 and 64 characters long"),  
  body("password").isString().isLength({min: 12, max: 128}).withMessage("password must be between 12 and 128 characters long"),
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
  
  console.log(request.body);

  const {username, password, display_name} = request.body;

  const new_user = User.build({"user_name": username, "display_name": display_name, "password": calculate_hash_for_plaintext_password(password)});  
  try {
  await new_user.save();
  }
  catch (e) {
    return response.status(409).send();
  }

  response.status(200).send();
});

export default router;