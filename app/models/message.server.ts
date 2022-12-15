import type { message } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export type { message } from "@prisma/client";

export function createMessage({
  text,
  card_id,
  from,
  color_id,
  font_id,
}: Pick<message, "text" | "card_id" | "from" | "color_id" | "font_id">) {
  return prisma.message.create({
    data: {
      text,
      card_id,
      from,
      color_id,
      font_id,
    },
  });
}

export async function deleteMessage({
  cardOwnerId,
  request,
  message_id,
}: Pick<message, "message_id"> & {
  cardOwnerId: number;
  request: Request;
}) {
  const userId = await requireUserId(request);
  if (userId !== cardOwnerId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return prisma.message.deleteMany({
    where: { message_id },
  });
}
