import { NextResponse } from 'next/server';

/**
 * Success Response Interface
 */
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error Response Interface
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/**
 * Pagination Metadata Interface
 */
interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Paginated Response Interface
 */
interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: Array<{ field: string; message: string }>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusCode }
  );
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMetadata
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
    },
    { status: 200 }
  );
}

/**
 * Create validation error response
 */
export function validationErrorResponse(
  message: string,
  details: Array<{ field: string; message: string }>
): NextResponse<ErrorResponse> {
  return errorResponse('VALIDATION_ERROR', message, 400, details);
}

/**
 * Create authentication error response
 */
export function authErrorResponse(
  message: string = 'Authentication failed'
): NextResponse<ErrorResponse> {
  return errorResponse('AUTH_ERROR', message, 401);
}

/**
 * Create authorization error response
 */
export function forbiddenErrorResponse(
  message: string = 'Access denied'
): NextResponse<ErrorResponse> {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Create not found error response
 */
export function notFoundErrorResponse(
  resource: string = 'Resource'
): NextResponse<ErrorResponse> {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404);
}

/**
 * Create conflict error response
 */
export function conflictErrorResponse(message: string): NextResponse<ErrorResponse> {
  return errorResponse('CONFLICT', message, 409);
}

/**
 * Create internal server error response
 */
export function internalServerErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ErrorResponse> {
  return errorResponse('INTERNAL_SERVER_ERROR', message, 500);
}
