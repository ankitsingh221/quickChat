import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Auth route working"
  });
});


router.get("/login", (req, res) => {
   res.send("login route");
});

export default router;
