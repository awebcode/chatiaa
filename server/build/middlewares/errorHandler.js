"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.CustomErrorHandler = void 0;
class CustomErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomErrorHandler = CustomErrorHandler;
const notFoundHandler = (req, res, next) => {
    next(new CustomErrorHandler(`Request ${req.url} not found!`, 404));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    // Wrong Mongodb Id error
    if (err.name === "CastError" && err.path) {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new CustomErrorHandler(message, 400);
    }
    // Mongoose duplicate key error
    if (err.code === 11000 && err.keyValue) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new CustomErrorHandler(message, 400);
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again`;
        err = new CustomErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again`;
        err = new CustomErrorHandler(message, 400);
    }
    // Reference error
    if (err.name === "ReferenceError") {
        const message = `Reference error occurred: ${err.message}`;
        err = new CustomErrorHandler(message, 500);
    }
    // Validation error
    if (err.name === "ValidationError" && err.errors) {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        err = new CustomErrorHandler(message, 400);
    }
    // Invalid ObjectId error
    if (err.name === "CastError" && err.path === "_id" && err.kind === "ObjectId") {
        const message = "Invalid ObjectId";
        err = new CustomErrorHandler(message, 400);
    }
    res.status(err.statusCode || 500).json({
        status: false,
        success: false,
        statusCode: err.statusCode,
        message: err.message,
    });
};
exports.errorHandler = errorHandler;
