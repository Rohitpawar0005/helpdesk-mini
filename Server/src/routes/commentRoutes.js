import express from "express";
import { addComment, getComments } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/", addComment); // add comment
router.get("/", getComments); // get all comments

export default router;
