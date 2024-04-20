import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getSubscribedChnnels, 
    getUserChannelSubscribers, 
    toggleSubscription, 
    unsubscribeChannnel
} from "../controllers/subscription.controller.js";


const router=Router()

router.use(verifyJWT)

router.route("/c/:channelId")
      .get(getSubscribedChnnels)
      .post(toggleSubscription)
      .get(unsubscribeChannnel)

router.route("/u/:channelId").get(getUserChannelSubscribers)

export default router
