import { Router } from "express";
import { logOutUser, loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutUser) // first verify user is login or not that why using verifyJWT middleware


export default router