import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  errors?: ApiError[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponseHelper {
  static success<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta }),
    });
  }

  static error(
    message: string,
    status: number = 400,
    code?: string,
    field?: string
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
          field,
        },
      },
      { status }
    );
  }

  static validationError(errors: z.ZodError): NextResponse<ApiResponse> {
    const formattedErrors = errors.errors.map((error) => ({
      message: error.message,
      code: 'VALIDATION_ERROR',
      field: error.path.join('.'),
    }));

    return NextResponse.json(
      {
        success: false,
        errors: formattedErrors,
      },
      { status: 400 }
    );
  }

  static unauthorized(message: string = 'לא מורשה'): NextResponse<ApiResponse> {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'אין הרשאה'): NextResponse<ApiResponse> {
    return this.error(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'לא נמצא'): NextResponse<ApiResponse> {
    return this.error(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'קונפליקט'): NextResponse<ApiResponse> {
    return this.error(message, 409, 'CONFLICT');
  }

  static internalError(message: string = 'שגיאה פנימית'): NextResponse<ApiResponse> {
    return this.error(message, 500, 'INTERNAL_ERROR');
  }
}

export function withErrorHandling(
  handler: (request: Request, context: any) => Promise<NextResponse>
) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof z.ZodError) {
        return ApiResponseHelper.validationError(error);
      }

      if (error instanceof Error) {
        // Check for specific database errors
        if (error.message.includes('Unique constraint')) {
          return ApiResponseHelper.conflict('הנתון כבר קיים במערכת');
        }

        if (error.message.includes('Foreign key constraint')) {
          return ApiResponseHelper.error('לא ניתן למחוק - קיימות התייחסויות לנתון זה');
        }

        if (error.message.includes('Record to delete does not exist')) {
          return ApiResponseHelper.notFound('הנתון לא נמצא');
        }
      }

      return ApiResponseHelper.internalError();
    }
  };
}