export type Role = "CLIENT" | "BARBER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload extends AuthTokens {
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Envelope padrão da API. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Resposta paginada (ex.: listagem de usuários). */
export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  pagination: Pagination;
}

/** Usuário como retornado pelas rotas administrativas. */
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  role: { name: Role };
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  active?: boolean;
}

/** DTO de barbeiro (User + perfil Barber achatados). */
export interface Barber {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  specialty?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  instagram?: string | null;
  socials?: Record<string, unknown> | null;
  isActive: boolean;
  averageRating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface CreateBarberInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  photoUrl?: string;
  instagram?: string;
}

export interface UpdateBarberInput {
  name?: string;
  phone?: string | null;
  specialty?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  instagram?: string | null;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateServiceInput {
  name: string;
  price: number;
  durationMinutes: number;
  category?: string;
  description?: string;
  imageUrl?: string;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface WorkingHour {
  id: string;
  barberId: string;
  weekday: number; // 0=domingo .. 6=sábado
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isActive: boolean;
}

/** Entrada para salvar a grade semanal (PUT). */
export interface WorkingHourInput {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  barberId: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
  createdAt: string;
}

export interface CreateBlockedDateInput {
  startAt: string;
  endAt: string;
  reason?: string;
}

/** Slot livre retornado pelo cálculo de disponibilidade. */
export interface AvailabilitySlot {
  time: string; // "09:30"
  start: string; // ISO
  end: string; // ISO
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface AppointmentServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  totalPrice: number;
  totalDuration: number;
  barber: { id: string; name: string };
  client: { id: string; name: string };
  services: AppointmentServiceItem[];
  review?: { id: string; rating: number } | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  clientName: string;
  createdAt: string;
}

export interface BarberReviews {
  average: number;
  count: number;
  items: Review[];
}

export interface CreateAppointmentInput {
  barberId: string;
  serviceIds: string[];
  startTime: string; // ISO
  notes?: string;
}

export interface ListAppointmentsParams {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  barberId?: string;
}

export interface DashboardOverview {
  scope: "ADMIN" | "BARBER";
  period: { from: string; to: string };
  metrics: {
    todayAppointments: number;
    periodRevenue: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    clientsServed: number;
  };
  byStatus: Record<AppointmentStatus, number>;
  revenueByDay: { date: string; revenue: number }[];
}

export interface ReportSummary {
  period: { from: string; to: string };
  totals: {
    appointments: number;
    completed: number;
    canceled: number;
    cancellationRate: number;
    revenue: number;
  };
  byStatus: Record<AppointmentStatus, number>;
  revenueByBarber: { barberId: string; barberName: string; completed: number; revenue: number }[];
  topServices: { serviceId: string; serviceName: string; count: number; revenue: number }[];
}
