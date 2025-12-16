import request from "../utils/request";

export type UpdateAccountPayload = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export const updateAccount = async (
  payload: UpdateAccountPayload
): Promise<{ id: string; username: string; email: string }> => {
  return request<{ id: string; username: string; email: string }>(
    "/apis/users/me",
    {
      method: "PUT",
      data: payload,
    }
  );
};

export type UserDetail = {
  id: string;
  username: string;
  email: string;
  status: "active" | "inactive";
  role?: { name: string; description?: string } | null;
};

export const getUserById = async (id: string): Promise<UserDetail> => {
  return request<UserDetail>(`/apis/users/${id}`, { method: "GET" });
};
