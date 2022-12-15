import type { message } from "@prisma/client";
import { prisma } from "~/db.server";

export type { message } from "@prisma/client";

export function deleteMessage({ message_id }: Pick<message, "message_id">) {
  return prisma.message.deleteMany({
    where: { message_id },
  });
}