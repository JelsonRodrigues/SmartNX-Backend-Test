import {Router} from 'express';
import usersRouter from "./users.mjs";
import authRouter from "./auth.mjs";
// import productsRouter from "./products.mjs";

const router = Router();

router.use(usersRouter);
router.use(authRouter);
// router.use(productsRouter);

export default router;