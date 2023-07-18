module.exports = (err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({ error: err.message || "Something went wrong. Please try again later." });
};
