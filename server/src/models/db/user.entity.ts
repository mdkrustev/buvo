import { UserRole } from "../enums/user-role.enum";

export interface UserEntity {
  id: number;
  email: string;
  name: string;
  google_id?: string;
  plan_id: number;
  role: UserRole;
  login_at?: string;
  created_at: string;
}
