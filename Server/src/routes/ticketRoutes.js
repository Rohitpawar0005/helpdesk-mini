import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
} from "../controllers/ticketController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import commentRoutes from "./commentRoutes.js";

const router = express.Router();

router.use(protect); // all routes need authentication
router.use("/:id/comments", commentRoutes);

router.post("/", createTicket); // create ticket
router.get("/", getTickets); // get all tickets
router.get("/:id", getTicketById); // get single ticket
router.patch("/:id", authorizeRoles("admin", "agent"), updateTicket); // update ticket (PATCH)

export default router;
