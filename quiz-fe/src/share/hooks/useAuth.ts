import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from "../services/authService";

const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  account: () => [...AUTH_QUERY_KEYS.all, "account"] as const,
  login: () => [...AUTH_QUERY_KEYS.all, "login"] as const,
};

export const useAccount = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.account(),
    queryFn: async () => {
      const response = await authService.getAccount();
      if (response.code === 1000) {
        const userObj = response.result?.user ?? response.result;
        if (!userObj) return userObj;

        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200";
        const minioBase =
          process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
        const minioBucket =
          process.env.NEXT_PUBLIC_MINIO_BUCKET || "quiz-files";

        let avatar = userObj.avatar ?? userObj.avatarUrl;
        if (avatar && typeof avatar === "string") {
          if (/^https?:\/\//i.test(avatar)) {
          } else if (
            process.env.NEXT_PUBLIC_MINIO_PUBLIC === "true" &&
            minioBase &&
            minioBucket
          ) {
            avatar = `${minioBase.replace(
              /\/$/,
              ""
            )}/${minioBucket}/${avatar.replace(/^\/+/, "")}`;
          } else {
            avatar = `${apiBase}/files/public/view?path=${encodeURIComponent(
              avatar
            )}`;
          }
        }

        return { ...userObj, avatar };
      }
      throw new Error(response.message || "Failed to get account");
    },
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("access_token"),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);
      if (response.code === 1000 && response.result) {
        localStorage.setItem("access_token", response.result.access_token);
        if (response.result.refresh_token) {
          localStorage.setItem("refresh_token", response.result.refresh_token);
        }
        return response.result;
      }
      throw new Error(response.message || "Login failed");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.account() });

      queryClient.setQueryData(AUTH_QUERY_KEYS.account(), data.user);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await authService.register(payload);
      if (response.code === 1000 && response.result) {
        return response.result;
      }
      throw new Error(response.message || "Register failed");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authService.logout();

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });

      router.push("/auth/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      router.push("/auth/login");
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authService.refreshToken();
      if (response.code === 1000 && response.result) {
        localStorage.setItem("access_token", response.result.access_token);
        if (response.result.refresh_token) {
          localStorage.setItem("refresh_token", response.result.refresh_token);
        }
        return response.result;
      }
      throw new Error(response.message || "Refresh failed");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.account() });
    },
  });
};

export const useIsAuthenticated = () => {
  const { data: account, isLoading, error } = useAccount();

  return {
    isAuthenticated: !!account && !error,
    user: account,
    isLoading,
    error,
  };
};
