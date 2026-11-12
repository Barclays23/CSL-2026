export interface AdminUser { _id: string; name: string; email: string; role: "admin"; status: "active" | "blocked"; }
export interface LoginCredentials { email: string; password: string; }
export interface LoginResponse { user: AdminUser; }
