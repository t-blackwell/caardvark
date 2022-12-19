import type { password, user } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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
  return prisma.user.update({ 
    data: { deleted: 'Y' },
    where: { email }, 
 });
}

export async function updateUser({
  request,
  email,
  first_name,
  last_name
}: Pick<user, "email" | "first_name" | "last_name"> & {
  request: Request;
}) {
  const userId = await requireUserId(request);

  return prisma.user.update({
    data: { email, first_name, last_name, updated_date: new Date() },
    where: { user_id: userId },
  });
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

  if (!userWithPassword || !userWithPassword.password || userWithPassword.deleted === 'Y') {
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
