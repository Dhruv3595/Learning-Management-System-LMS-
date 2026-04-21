import { Router } from "express";
import {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseById,
  deleteCourseLecture,
  updateCourseLecture,
} from "../controllers/course.controller.js";
import {
  isLoggedIn,
  authorisedRoles,
  authorizeSubscriber,
  authorizeCourseAccess,
} from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorisedRoles("ADMIN"),
    upload.single('thumbnail'),
    createCourse
  )
  .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteCourseLecture)
  .put(
    isLoggedIn,
    authorisedRoles("ADMIN"),
    upload.single("lecture"),
    updateCourseLecture
  );

router
  .route("/:id")
  .get(isLoggedIn, authorizeCourseAccess, getLecturesByCourseId)
  .put(
    isLoggedIn,
    authorisedRoles("ADMIN"),
    upload.single('thumbnail'),
    updateCourse
  )
  .delete(isLoggedIn, authorisedRoles("ADMIN"), removeCourse)
  .post(
    isLoggedIn,
    authorisedRoles("ADMIN"),
    upload.single("lecture"),
    addLectureToCourseById
  );

export default router;
