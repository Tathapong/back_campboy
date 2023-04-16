module.exports = (req, res, next) => {
  return res.status(404).json({ message: "resource not found on this server" });
};
