// client/src/lib/schemas/adminAuth.ts

export interface AdminCreate {
    email: string;
    password: string;
    full_name: string;
    username: string; // required for admin accounts
  }
  
  export interface AdminResponse {
    id: number;
    email: string;
    full_name: string;
    username: string;
    is_superuser: boolean;
    is_verified: boolean;
    created_at: string;
  }
  
  export interface AdminTokenResponse {
    access_token: string;
    token_type: string;
    message?: string;
  }
  