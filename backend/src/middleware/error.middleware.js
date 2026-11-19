const errorHandler = (err, req, res, next) => {
  console.log("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Server Error"
  });
};

module.exports = errorHandler;