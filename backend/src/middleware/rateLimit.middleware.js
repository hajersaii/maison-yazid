const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // limit each IP
  message: {
    success: false,
    error: "Too many requests, try again later"
  }
});

module.exports = limiter;