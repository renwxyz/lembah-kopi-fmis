export type AdminRole = "SUPER_ADMIN" | "ADMIN_KELOMPOK_TANI";

export interface UserAdmin {
  id_admin: string;
  username: string;
  email: string;
  nama_lengkap: string;
  role: AdminRole;
  status_aktif: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginInput {
  username_or_email: string;
  password: string;
}

export interface LoginData {
  token_type: "Bearer";
  access_token: string;
  expires_at: string;
  user: UserAdmin;
}

export interface ChangePasswordInput {
  password_lama: string;
  password_baru: string;
  konfirmasi_password_baru: string;
}
