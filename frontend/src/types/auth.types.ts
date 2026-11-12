export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin";
  status: "active" | "blocked";
}
