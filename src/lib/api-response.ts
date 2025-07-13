import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta,
  });
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

// Common error responses
export const AuthErrors = {
  UNAUTHORIZED: () => createErrorResponse('AUTH_REQUIRED', 'נדרשת הזדהות', 401),
  FORBIDDEN: () => createErrorResponse('FORBIDDEN', 'אין הרשאה', 403),
  INACTIVE_USER: () => createErrorResponse('INACTIVE_USER', 'החשבון לא פעיל', 403),
};

export const ValidationErrors = {
  MISSING_FIELDS: (fields: string[]) => 
    createErrorResponse('VALIDATION_ERROR', `חסרים פרטים נדרשים: ${fields.join(', ')}`),
  INVALID_FORMAT: (field: string) => 
    createErrorResponse('VALIDATION_ERROR', `פורמט לא תקין: ${field}`),
};

export const NotFoundErrors = {
  USER: () => createErrorResponse('NOT_FOUND', 'המשתמש לא נמצא', 404),
  GAME: () => createErrorResponse('NOT_FOUND', 'המשחק לא נמצא', 404),
  CENTER: () => createErrorResponse('NOT_FOUND', 'המוקד לא נמצא', 404),
  RENTAL: () => createErrorResponse('NOT_FOUND', 'ההשאלה לא נמצאה', 404),
};

// Simple apiResponse function for new API style
export function apiResponse<T>(
  success: boolean,
  data?: T,
  error?: { message: string; details?: any },
  status: number = 200
): NextResponse {
  let response: NextResponse;
  
  if (success) {
    response = NextResponse.json({ success: true, data }, { status });
  } else {
    response = NextResponse.json({ success: false, error }, { status });
  }
  
  // Add CORS headers in development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return response;
}

// Convenience exports for backward compatibility
export const successResponse = createSuccessResponse;
export const errorResponse = createErrorResponse;