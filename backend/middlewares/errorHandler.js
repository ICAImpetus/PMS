import logger from "../utils/winston.js";

/* eslint-disable no-unused-vars */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

const general = (err, req, res, next) => {
  logger.error({
    type: "ERROR",
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
    userId: req.user?.id || null
  });
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default { notFound, general };

