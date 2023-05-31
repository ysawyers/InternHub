import { listingsController } from "../controllers/listings";
import { userController } from "../controllers/user";
import { messagesController } from "../controllers/messages";
import express, { Request } from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, parts: 4 }, fileFilter });

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
}

router.get("/user/data", userController.fetchUser);
router.get("/user/profile/:userId", userController.fetchProfile);
router.put(
  "/user/profile/update",
  upload.fields([{ name: "profilePicture" }, { name: "email" }, { name: "bio" }]),
  userController.updateProfile
);
router.delete("/user/logout", userController.logout);
router.post("/user/block/:blockedId", userController.blockUser);
router.post("/listings/new", listingsController.createListing);
router.get("/listings/recent", listingsController.fetchRecentListings);
router.delete("/listings/:listingId/remove", listingsController.deleteListing);

router.get("/messages/relationships", messagesController.fetchMessages);
router.post("/messages/new-relationship/:receiverId", messagesController.createRelationship);
router.get("/messages/chat/:messageId", messagesController.fetchChat);
router.get("/messages/relationship/:receiverId", messagesController.fetchRelationship);

export default router;
