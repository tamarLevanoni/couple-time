import { RentalStatus } from '@/types';
import { cn } from '@/lib/utils';

interface RentalTabsProps {
  selectedStatus: RentalStatus;
  onStatusChange: (status: RentalStatus) => void;
  counts: {
    pending: number;
    active: number;
    returned: number;
    cancelled: number;
  };
}

interface Tab {
  id: RentalStatus;
  label: string;
  count: number;
  colorClasses: {
    inactive: string;
    active: string;
    badge: string;
  };
}

export function RentalTabs({ selectedStatus, onStatusChange, counts }: RentalTabsProps) {
  const tabs: Tab[] = [
    {
      id: 'PENDING',
      label: 'ממתין',
      count: counts.pending,
      colorClasses: {
        inactive: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
        active: 'text-yellow-700 bg-yellow-50 border-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
      },
    },
    {
      id: 'ACTIVE',
      label: 'פעיל',
      count: counts.active,
      colorClasses: {
        inactive: 'text-green-600 hover:text-green-700 hover:bg-green-50',
        active: 'text-green-700 bg-green-50 border-green-600',
        badge: 'bg-green-100 text-green-700',
      },
    },
    {
      id: 'RETURNED',
      label: 'הוחזר',
      count: counts.returned,
      colorClasses: {
        inactive: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
        active: 'text-blue-700 bg-blue-50 border-blue-600',
        badge: 'bg-blue-100 text-blue-700',
      },
    },
    {
      id: 'CANCELLED',
      label: 'בוטל',
      count: counts.cancelled,
      colorClasses: {
        inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
        active: 'text-gray-700 bg-gray-100 border-gray-600',
        badge: 'bg-gray-200 text-gray-600',
      },
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Desktop tabs */}
      <nav className="hidden md:flex md:space-x-8 md:space-x-reverse px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-all',
                isActive
                  ? `${tab.colorClasses.active.split(' ')[0]} ${tab.colorClasses.active.split(' ')[1]} border-current`
                  : 'border-transparent ' + tab.colorClasses.inactive
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'mr-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                  isActive ? tab.colorClasses.badge : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile tabs - scrollable */}
      <div className="md:hidden overflow-x-auto scrollbar-hide">
        <nav className="flex space-x-2 space-x-reverse px-4 py-3" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                  isActive
                    ? tab.colorClasses.active + ' border-current'
                    : 'border-gray-200 ' + tab.colorClasses.inactive
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium min-w-[1.25rem]',
                    isActive ? tab.colorClasses.badge : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
