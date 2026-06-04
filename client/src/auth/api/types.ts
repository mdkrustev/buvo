//src/auth/api/types.ts

import { UserRole } from "./enums";


export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRoleType;
}
