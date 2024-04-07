import { Router } from "express";
import { changeCurrentPasssword,
        getCurrentUser,
        getUserChannelProfile,
        getWatchHistory,
        logOutUser,
        loginUser, 
        refreshAccessToken, 
        registerUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImge
     } from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPasssword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImge)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router