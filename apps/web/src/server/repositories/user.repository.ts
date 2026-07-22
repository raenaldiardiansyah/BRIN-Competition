import type { User } from "@/features/users/types/user";

const users: User[] = [
  { id: "1", name: "Admin", email: "admin@example.com" },
];

export const userRepository = {
  async findAll(): Promise<User[]> {
    return users;
  },

  async findById(id: string): Promise<User | undefined> {
    return users.find((user) => user.id === id);
  },

  async create(data: Omit<User, "id">): Promise<User> {
    const user = { id: crypto.randomUUID(), ...data };
    users.push(user);
    return user;
  },
};
