'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, CalendarIcon, UserIcon, GamepadIcon, MessageCircleIcon, HomeIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RentalDetails {
  id: string;
  games: Array<{
    game: {
      name: string;
      category: string;
    };
  }>;
  center: {
    name: string;
    coordinator: {
      name: string;
      whatsappNumber?: string;
    };
  };
  requestDate: string;
  expectedReturnDate?: string;
  status: string;
}

export default function RentalConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rentalId = searchParams.get('id');

  useEffect(() => {
    if (!rentalId) {
      setError('No rental ID provided');
      setIsLoading(false);
      return;
    }

    const fetchRentalDetails = async () => {
      try {
        const response = await fetch(`/api/rentals/${rentalId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to load rental details');
        }

        setRental(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rental details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentalDetails();
  }, [rentalId]);

  const generateWhatsAppMessage = () => {
    if (!rental) return '';
    
    const gameNames = rental.games.map(g => g.game.name).join(', ');
    const message = encodeURIComponent(
      `Hi! I've just submitted a rental request for ${gameNames} at ${rental.center.name}. ` +
      `My rental ID is ${rental.id}. Could you please confirm the availability and pickup details? Thank you!`
    );
    
    return `https://wa.me/${rental.center.coordinator.whatsappNumber}?text=${message}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rental details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-destructive mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Unable to Load Rental</h2>
            <p className="text-muted-foreground mb-4">{error || 'Rental not found'}</p>
            <Button onClick={() => router.push('/')}>
              <HomeIcon className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Rental Request Submitted!</h1>
          <p className="text-muted-foreground">
            Your rental request has been successfully submitted and is awaiting coordinator approval.
          </p>
        </div>

        {/* Rental Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GamepadIcon className="w-5 h-5" />
              Rental Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rental ID */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Rental ID</span>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                {rental.id}
              </code>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="secondary">
                {rental.status}
              </Badge>
            </div>

            {/* Games */}
            <div>
              <span className="text-sm font-medium block mb-2">Games Requested</span>
              <div className="space-y-2">
                {rental.games.map((gameRental, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{gameRental.game.name}</span>
                    <Badge variant="outline">{gameRental.game.category}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Center */}
            <div>
              <span className="text-sm font-medium block mb-2">Center</span>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">{rental.center.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <UserIcon className="w-4 h-4" />
                  Coordinator: {rental.center.coordinator.name}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium block mb-2">Request Date</span>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(rental.requestDate)}</span>
                </div>
              </div>
              {rental.expectedReturnDate && (
                <div>
                  <span className="text-sm font-medium block mb-2">Expected Return</span>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(rental.expectedReturnDate)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-medium">Coordinator Review</div>
                  <div className="text-sm text-muted-foreground">
                    The center coordinator will review your request and check game availability.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-medium">Approval & Pickup Details</div>
                  <div className="text-sm text-muted-foreground">
                    Once approved, you'll receive pickup instructions and timing details.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium">Game Pickup</div>
                  <div className="text-sm text-muted-foreground">
                    Visit the center at the scheduled time to collect your games.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* WhatsApp Contact */}
          {rental.center.coordinator.whatsappNumber && (
            <a 
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base bg-[#f15555] text-white hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-1 sm:flex-none"
            >
              <MessageCircleIcon className="w-4 h-4" />
              Contact Coordinator
            </a>
          )}

          {/* View My Rentals */}
          {session && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/my-rentals')}
              className="flex-1 sm:flex-none"
            >
              View My Rentals
            </Button>
          )}

          {/* Home */}
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex-1 sm:flex-none"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Information Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Keep this information handy</div>
              <div className="text-blue-700">
                Save your rental ID ({rental.id}) for reference. You can always check the status of your rentals in your profile.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}