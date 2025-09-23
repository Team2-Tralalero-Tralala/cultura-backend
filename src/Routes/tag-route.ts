import { Router } from "express";
import { createTag, deleteTag, editTag, getAllTags} from "../Controllers/tag-controller.js";

const tagRoutes = Router();

tagRoutes.post("/createTag", createTag);
tagRoutes.delete("/deleteTag/:id", deleteTag);
tagRoutes.put("/editTag/:id", editTag);
tagRoutes.get("/getAllTags", getAllTags);

export default tagRoutes;
