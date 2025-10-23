// server/middleware/errorMiddleware.js

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); 
};

const errorHandler = (err, req, res, next) => {
    // Determine the status code (default to 500 if the response status is 200)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; 
    res.status(statusCode);

    res.json({
        message: err.message,
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };