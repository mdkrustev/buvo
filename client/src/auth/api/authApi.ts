// src/auth/api/authApi.ts

import { BaseApi } from "../../shared/utils/apiFetch";
import { type User } from "./types"; 

export class AuthApi extends BaseApi {
  
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  /**
   * GET /auth/me
   * Returns the currently authenticated user's information.
  */
  
  getMe() {
    return this.get<User>('/auth/me');
  }
  
  logOut() {
    return this.post('/auth/logout');
  }
  
  updateProfile(data: Partial<User>) {
    return this.put<User>('/auth/profile', data);
  }
}

const API_URL = import.meta.env.VITE_API_URL;

export const authApi = new AuthApi(API_URL);