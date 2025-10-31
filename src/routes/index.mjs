import { Router } from "express";
import usersRouter from "./users.mjs";
import authRouter from "./auth.mjs";
import postsRouter from "./posts.mjs";
import commentsRouter from "./comments.mjs";

const router = Router();

router.use(usersRouter);
router.use(authRouter);
router.use(postsRouter);
router.use(commentsRouter);

export default router;
