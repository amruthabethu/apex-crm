import { db, User } from "../config/db";

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const users = db.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const users = db.getUsers();
    const user = users.find((u) => u._id === id);
    return user || null;
  }

  static async create(userData: Omit<User, "_id">): Promise<User> {
    const users = db.getUsers();
    const newUser: User = {
      ...userData,
      _id: "user_" + Math.random().toString(36).substr(2, 9)
    };
    users.push(newUser);
    db.setUsers(users);
    return newUser;
  }
}
