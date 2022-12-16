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
  image_url,
}: Pick<
  message,
  "text" | "card_id" | "from" | "color_id" | "font_id" | "image_url"
>) {
  return prisma.message.create({
    data: {
      text,
      card_id,
      from,
      color_id,
      font_id,
      image_url,
    },
  });
}

export async function deleteMessage({
  request,
  message_id,
}: Pick<message, "message_id"> & {
  request: Request;
}) {
  const userId = await requireUserId(request);

  return prisma.message.deleteMany({
    where: { message_id, card: { user_id: userId } },
  });
}

export function getFonts() {
  return prisma.font.findMany({
    select: { font_id: true, name: true },
  });
}

export function getFontByName(name: string) {
  return prisma.font.findFirst({
    select: {
      font_id: true,
    },
    where: { name },
  });
}

export function getColorByHex(hex: string) {
  return prisma.color.findFirst({
    select: {
      color_id: true,
    },
    where: { hex: hex.toUpperCase() },
  });
}

export function getColors() {
  return prisma.color.findMany({
    select: { color_id: true, name: true, hex: true },
  });
}
