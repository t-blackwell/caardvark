import type { password, user } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { user } from "@prisma/client";

export async function getUserById(user_id: user["user_id"]) {
  return prisma.user.findUnique({ where: { user_id } });
}

export async function getUserByEmail(email: user["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: user["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: user["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: user["email"],
  password: password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
