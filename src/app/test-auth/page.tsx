'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">🔐 Auth Flow Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Session Status:</h2>
            <p>Status: {status}</p>
          </div>

          {session ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">User Data:</h2>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(session.user, null, 2)}
              </pre>
              
              <div className="mt-4">
                <Button onClick={() => signOut()}>Sign Out</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Sign In Options:</h2>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => signIn('google')}
                  className="w-full"
                >
                  Sign in with Google
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => signIn('credentials', { 
                    email: 'test@example.com', 
                    password: 'password' 
                  })}
                  className="w-full"
                >
                  Sign in with Test Credentials
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}