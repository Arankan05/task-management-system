const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/projectController");

router.use(auth);

router.get("/", ctrl.listProjects);
router.post("/", ctrl.createProject);

module.exports = router;
