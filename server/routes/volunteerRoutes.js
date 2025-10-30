import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { saveVolunteerData, getAvailableVolunteers } from "../controllers/volunteerController.js";

const router = express.Router();

router.post("/save", protect, saveVolunteerData);
router.get("/recent", protect, getAvailableVolunteers);

export default router;
