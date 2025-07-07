export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'USER' | 'COORDINATOR' | 'SUPER_COORDINATOR' | 'ADMIN'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Game {
  id: string
  name: string
  description: string
  category: string
  ageRange: string
  players: string
  duration: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface Center {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  coordinatorId?: string
  coordinator?: User
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GameInstance {
  id: string
  gameId: string
  game: Game
  centerId: string
  center: Center
  status: 'AVAILABLE' | 'RENTED' | 'DAMAGED' | 'LOST'
  condition: string
  createdAt: Date
  updatedAt: Date
}

export interface Rental {
  id: string
  userId: string
  user: User
  gameInstanceId: string
  gameInstance: GameInstance
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED'
  requestedAt: Date
  approvedAt?: Date
  dueDate?: Date
  returnedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}