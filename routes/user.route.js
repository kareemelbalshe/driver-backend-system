import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { deleteDriver, deleteUser, getAllDrivers, getAllUsers, getAvailableDrivers, getDriverProfile, getUserProfile, searchAboutDriver, setAvailableDriver, setUnavailableDriver, updateDriverProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/get-all-drivers", getAllDrivers)
router.get("/get-all-users", getAllUsers)
router.get("/get-user-profile", verifyToken, getUserProfile)
router.get("/get-driver-profile", verifyToken, getDriverProfile)
router.post("/update-driver-profile", verifyToken, updateDriverProfile)
router.delete("/delete-user", verifyToken, deleteUser)
router.delete("/delete-driver", verifyToken, deleteDriver)
router.post("/search-about-driver", searchAboutDriver)
router.post("/get-available-drivers", getAvailableDrivers)
router.post("/set-available-driver", verifyToken, setAvailableDriver)
router.post("/set-unavailable-driver", verifyToken, setUnavailableDriver)

export default router;