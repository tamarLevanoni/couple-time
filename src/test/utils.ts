import { expect } from 'vitest';

// Shared generic test helpers for API responses

/**
 * Expects a successful API response (status 200, success: true) and optionally checks the returned data.
 */
export async function expectSuccessResponse(response: Response, expectedData?: any) {
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
  if (expectedData) {
    expect(data.data).toEqual(expect.objectContaining(expectedData));
  }
  return data.data;
}

/**
 * Expects an error API response (status code, success: false) and optionally checks the error message.
 */
export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
) {
  expect(response.status).toBe(expectedStatus);
  const data = await response.json();
  expect(data.success).toBe(false);
  if (expectedMessage) {
    expect(data.error.message).toContain(expectedMessage);
  }
} 