const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const ctrl = require("../controllers/projectController");

router.use(auth);
router.use(ensurePasswordChanged);

router.get("/", ctrl.listProjects);
router.post("/", ctrl.createProject);

module.exports = router;
