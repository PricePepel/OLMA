// Common types used throughout the application
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  radius?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface Breadcrumb {
  label: string
  href?: string
  current?: boolean
}

export interface MenuItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
  badge?: string | number
  disabled?: boolean
}

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface FileUpload {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export interface Location {
  lat: number
  lng: number
  address?: string
  city?: string
  country?: string
}

export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  available: boolean
}

export interface Availability {
  timeSlots: TimeSlot[]
  timezone: string
  notes?: string
}

export interface Currency {
  type: 'personal' | 'club'
  amount: number
  symbol?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: string
  points: number
  unlocked: boolean
  unlockedAt?: Date
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl?: string
  score: number
  metric: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: Record<string, any>
}

export interface Report {
  id: string
  targetType: 'profile' | 'post' | 'club' | 'message'
  targetId: string
  reporterId: string
  reason: string
  description?: string
  status: 'open' | 'review' | 'resolved' | 'rejected'
  createdAt: Date
  resolvedAt?: Date
  moderatorId?: string
}

export interface UserStats {
  totalPosts: number
  totalSkills: number
  totalOffers: number
  totalClubs: number
  totalEvents: number
  totalMessages: number
  totalCurrency: number
  totalAchievements: number
  level: number
  experience: number
  rating: number
  streak: number
}

export interface ClubStats {
  totalMembers: number
  totalEvents: number
  totalPosts: number
  totalCurrency: number
  averageRating: number
  activeMembers: number
}

export interface EventStats {
  totalAttendees: number
  maxAttendees: number
  attendanceRate: number
  totalRevenue?: number
  averageRating?: number
}

// Form types
export interface FormState {
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export interface FormConfig {
  initialValues: Record<string, any>
  validationSchema?: any
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  onReset?: () => void
}

// API types
export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export interface ErrorProps extends BaseComponentProps {
  title?: string
  message?: string
  retry?: () => void
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
  }
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
export type NonNullable<T> = T extends null | undefined ? never : T
