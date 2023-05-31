import { authenticationController } from "../controllers/authentication";
import express from "express";

const router = express.Router();

router.post("/default-register", authenticationController.registerWithDefault);
router.post("/default-login", authenticationController.loginWithDefault);
router.post("/google-login", authenticationController.loginWithGoogle);
router.get("/refresh-token", authenticationController.refreshAccessToken);

export default router;
