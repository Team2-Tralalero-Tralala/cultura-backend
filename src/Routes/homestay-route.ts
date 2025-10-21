import { Router } from "express";
import {getHomestayByIdDto, getHomestayById} from "~/Controllers/homestay-controller.js";
import { validateDto } from "~/Libs/validateDto.js";
import { authMiddleware } from "~/Middlewares/auth-middleware.js";

const homestayRoutes = Router();

/*
 * Route: GET /homestay/detail/:homestayId
 * Output : รายละเอียด homestay + relations ตาม schema จริง
 */
homestayRoutes.get(
  "/super/homestay/:homestayId",
  validateDto(getHomestayByIdDto),
  authMiddleware,
  getHomestayById
);

export default homestayRoutes;
