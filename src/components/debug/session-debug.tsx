'use client';

import { useSession } from 'next-auth/react';

export function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Session Debug</h3>
      <div>Status: {status}</div>
      {session && (
        <div>
          <div>ID: {session.user?.id || 'none'}</div>
          <div>Email: {session.user?.email || 'none'}</div>
          <div>Name: {session.user?.name || 'none'}</div>
          <div>Needs Profile: {session.user?.needsProfileCompletion ? 'YES' : 'NO'}</div>
          <div>Google ID: {session.user?.googleId || 'none'}</div>
          <div>Roles: {session.user?.roles?.length || 0}</div>
        </div>
      )}
    </div>
  );
}