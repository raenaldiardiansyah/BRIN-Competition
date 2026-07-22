import type { User } from "@/features/users/types/user";
import { userRepository } from "@/server/repositories/user.repository";

function isCreateUserInput(value: unknown): value is Omit<User, "id"> {
  if (!value || typeof value !== "object") return false;

  const input = value as Record<string, unknown>;
  return typeof input.name === "string" && typeof input.email === "string";
}

export const userService = {
  findAll: () => userRepository.findAll(),
  findById: (id: string) => userRepository.findById(id),

  create(data: unknown) {
    if (!isCreateUserInput(data)) {
      throw new Error("Data pengguna tidak valid");
    }

    return userRepository.create(data);
  },
};
