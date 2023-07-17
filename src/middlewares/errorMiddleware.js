module.exports = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message || "Something went wrong. Please try again later." });
};
