import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventByDate,
  getEventById,
  updateEvent
} from "../Controller/EventController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all event routes
router.use(authMiddleware);

router.get("/", getAllEvents);
router.get("/by-date", getEventByDate);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
