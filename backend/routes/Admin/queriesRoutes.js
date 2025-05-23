const express = require("express");
const {
  createQuery,
  getQueries,
  updateQueryStatus,
  sendQueryStatusEmail
} = require("../../controllers/Admin/queryController");

const router = express.Router();

router.post("/", createQuery);
router.get("/", getQueries);
router.patch('/:id', updateQueryStatus);
router.post('/send-email/:id', sendQueryStatusEmail);

module.exports = router;