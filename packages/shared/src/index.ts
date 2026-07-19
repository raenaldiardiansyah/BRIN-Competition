export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type HealthData = {
  service: string;
  status: "ok";
};

export type ProjectVisibility =
  | "public"
  | "limited-preview"
  | "link-only"
  | "organization"
  | "private";
