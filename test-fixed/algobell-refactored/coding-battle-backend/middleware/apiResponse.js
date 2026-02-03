/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  /**
   * Success response
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error
   */
  static validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Not found error
   */
  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Unauthorized error
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden error
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Feature disabled response
   */
  static featureDisabled(res, featureName) {
    return this.error(
      res,
      `${featureName} feature is currently disabled. Check back later!`,
      503
    );
  }

  /**
   * Coming soon response (for pro features)
   */
  static comingSoon(res, featureName) {
    return res.status(200).json({
      success: true,
      message: `${featureName} is coming soon! 🚀`,
      comingSoon: true,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
