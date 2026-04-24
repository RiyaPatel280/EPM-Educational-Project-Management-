class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid,try again";
    err = new ErrorHandler(message, 400);
  }

  if (err.code === "TokenExpiredError") {
    const message = "JSON Web Token is expired,try again";
    err = new ErrorHandler(message, 400);
  }

  if (err.code === "CastError") {
    const message = "Resource not found. Invalid: " + err.path;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((value) => value.message)
        .join(", ")
    : err.message;

    return res.status(err.statusCode).json({
        success:false,
        message: err.message,
    })
};

export default ErrorHandler;