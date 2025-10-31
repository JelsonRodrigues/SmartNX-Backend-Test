import { validationResult } from "express-validator";

export default function doValidationOfRequest(request, response, next) {
  const result = validationResult(request);
  if (!result.isEmpty()) {
    return response.status(400).send(result.array());
  }
  next();
}
