import axios from "axios";
import { getCookie } from "./cookie"; // if you store tokens in cookies

const API_URL = "http://127.0.0.1:8000/api/v1/admin"; // base URL for admin routes

// Register a new admin
export const registerAdmin = async (adminData: {
  email: string;
  username: string;
  full_name: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/register`, adminData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error(err.message || "Admin registration failed");
  }
};

// Login admin and get token
export const loginAdmin = async (email: string, password: string) => {
  try {
    const params = new URLSearchParams();
    params.append("username", email); // OAuth2PasswordRequestForm expects `username`
    params.append("password", password);

    const response = await axios.post(`${API_URL}/login`, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Optionally store token in cookies/localStorage
    // setCookie('admin_token', response.data.access_token);

    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error(err.message || "Admin login failed");
  }
};

// Fetch current logged-in admin
export const getCurrentAdmin = async () => {
  try {
    const token = getCookie("admin_token"); // or wherever you store it
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data?.detail) {
      throw new Error(err.response.data.detail);
    }
    throw new Error(err.message || "Fetching admin data failed");
  }
};
