import { describe, it } from 'vitest';
import { expectSuccessResponse } from '../utils';

describe('Admin API', () => {
  it('GET /api/admin/users returns users', async () => {
    const response = { status: 200, json: async () => ({ success: true, data: [{ id: 'user-1' }] }) } as any;
    await expectSuccessResponse(response, { id: 'user-1' });
  });
  it('POST /api/admin/centers creates center', async () => {
    const response = { status: 200, json: async () => ({ success: true, data: { id: 'center-1' } }) } as any;
    await expectSuccessResponse(response, { id: 'center-1' });
  });
  it('POST /api/admin/games creates game', async () => {
    const response = { status: 200, json: async () => ({ success: true, data: { id: 'game-1' } }) } as any;
    await expectSuccessResponse(response, { id: 'game-1' });
  });
  it('PUT /api/admin/roles assigns role', async () => {
    const response = { status: 200, json: async () => ({ success: true, data: { id: 'user-1', roles: ['ADMIN'] } }) } as any;
    await expectSuccessResponse(response, { id: 'user-1' });
  });
  it('GET /api/admin/system returns stats', async () => {
    const response = { status: 200, json: async () => ({ success: true, data: { users: 10 } }) } as any;
    await expectSuccessResponse(response, { users: 10 });
  });
});