import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RentalStatus, GameInstanceStatus } from '@prisma/client';

export interface RentalItem {
  id: string;
  userId: string;
  gameInstanceId: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  gameInstance: {
    id: string;
    status: GameInstanceStatus;
    game: {
      id: string;
      name: string;
      description?: string;
      imageUrl?: string;
    };
    center: {
      id: string;
      name: string;
      city: string;
    };
  };
}

export interface RentalFilters {
  status?: RentalStatus[];
  centerId?: string;
  gameId?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface RentalsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RentalsState {
  // Data
  rentals: RentalItem[];
  selectedRental: RentalItem | null;
  
  // Filters and pagination
  filters: RentalFilters;
  pagination: RentalsPagination;
  sortBy: 'requestDate' | 'borrowDate' | 'expectedReturnDate' | 'status';
  sortOrder: 'asc' | 'desc';
  
  // UI state
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  setRentals: (rentals: RentalItem[]) => void;
  addRental: (rental: RentalItem) => void;
  updateRental: (id: string, updates: Partial<RentalItem>) => void;
  removeRental: (id: string) => void;
  setSelectedRental: (rental: RentalItem | null) => void;
  setFilters: (filters: Partial<RentalFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<RentalsPagination>) => void;
  setSorting: (sortBy: RentalsState['sortBy'], sortOrder: RentalsState['sortOrder']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Computed helpers
  getPendingRentals: () => RentalItem[];
  getActiveRentals: () => RentalItem[];
  getOverdueRentals: () => RentalItem[];
  getRentalsByUser: (userId: string) => RentalItem[];
  getRentalsByCenter: (centerId: string) => RentalItem[];
}

const initialPagination: RentalsPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useRentalsStore = create<RentalsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      rentals: [],
      selectedRental: null,
      filters: {},
      pagination: initialPagination,
      sortBy: 'requestDate',
      sortOrder: 'desc',
      loading: false,
      error: null,
      refreshing: false,

      // Actions
      setRentals: (rentals) =>
        set(() => ({ rentals }), false, 'setRentals'),

      addRental: (rental) =>
        set((state) => ({
          rentals: [rental, ...state.rentals],
        }), false, 'addRental'),

      updateRental: (id, updates) =>
        set((state) => ({
          rentals: state.rentals.map(rental =>
            rental.id === id ? { ...rental, ...updates } : rental
          ),
          selectedRental: state.selectedRental?.id === id
            ? { ...state.selectedRental, ...updates }
            : state.selectedRental,
        }), false, 'updateRental'),

      removeRental: (id) =>
        set((state) => ({
          rentals: state.rentals.filter(rental => rental.id !== id),
          selectedRental: state.selectedRental?.id === id ? null : state.selectedRental,
        }), false, 'removeRental'),

      setSelectedRental: (rental) =>
        set(() => ({ selectedRental: rental }), false, 'setSelectedRental'),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }), false, 'setFilters'),

      clearFilters: () =>
        set(() => ({
          filters: {},
          pagination: { ...initialPagination },
        }), false, 'clearFilters'),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        }), false, 'setPagination'),

      setSorting: (sortBy, sortOrder) =>
        set(() => ({ sortBy, sortOrder }), false, 'setSorting'),

      setLoading: (loading) =>
        set(() => ({ loading }), false, 'setLoading'),

      setError: (error) =>
        set(() => ({ error }), false, 'setError'),

      setRefreshing: (refreshing) =>
        set(() => ({ refreshing }), false, 'setRefreshing'),

      // Computed helpers
      getPendingRentals: () => {
        const { rentals } = get();
        return rentals.filter(rental => rental.status === RentalStatus.PENDING);
      },

      getActiveRentals: () => {
        const { rentals } = get();
        return rentals.filter(rental => rental.status === RentalStatus.ACTIVE);
      },

      getOverdueRentals: () => {
        const { rentals } = get();
        const now = new Date();
        return rentals.filter(rental =>
          rental.status === RentalStatus.ACTIVE &&
          rental.expectedReturnDate &&
          new Date(rental.expectedReturnDate) < now
        );
      },

      getRentalsByUser: (userId) => {
        const { rentals } = get();
        return rentals.filter(rental => rental.userId === userId);
      },

      getRentalsByCenter: (centerId) => {
        const { rentals } = get();
        return rentals.filter(rental => rental.gameInstance.center.id === centerId);
      },
    }),
    {
      name: 'rentals-store',
    }
  )
);