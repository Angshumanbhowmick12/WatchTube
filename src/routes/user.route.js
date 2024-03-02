import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
           name:"coverImage",
           maxCount: 1 
        }
    ]) // fields accept array 
    ,registerUser) // when this route call then post method call pass to controller

export default router