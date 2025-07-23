'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUserName } from '@/lib/utils';
import type { CenterWithCoordinator } from '@/types';

interface CenterManagementTableProps {
  centers: CenterWithCoordinator[];
  onEditCenter: (centerId: string) => void;
  onDeleteCenter: (centerId: string) => void;
  onViewDetails: (centerId: string) => void;
  isSubmitting?: boolean;
}

export function CenterManagementTable({ 
  centers, 
  onEditCenter, 
  onDeleteCenter, 
  onViewDetails, 
  isSubmitting = false 
}: CenterManagementTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Center Management</CardTitle>
      </CardHeader>
      <CardContent>
        {centers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No centers found</p>
        ) : (
          <div className="space-y-4">
            {centers.map((center) => (
              <div key={center.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{center.name}</span>
                    <Badge variant="outline">{center.area}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {center.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coordinator: {center.coordinator ? formatUserName(center.coordinator.firstName, center.coordinator.lastName) : 'No coordinator assigned'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(center.id)}
                    disabled={isSubmitting}
                  >
                    Details
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditCenter(center.id)}
                    disabled={isSubmitting}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteCenter(center.id)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}