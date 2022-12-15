import type { card, user } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "~/db.server";

export type { card } from "@prisma/client";

const selectCardColumns = {
  card_id: true,
  hash: true,
  card_template_id: true,
  from: true,
  to: true,
  published_date: true,
  deleted: true,
  created_date: true,
  updated_date: true,
  card_template: true,
};

const selectMessageColumns = {
  message_id: true,
  from: true,
  text: true,
  color_id: true,
  font_id: true,
  image_url: true,
  deleted: true,
  created_date: true,
  updated_date: true,
};

export function getCard({
  hash,
  user_id,
}: Pick<card, "hash"> & {
  user_id: user["user_id"];
}) {
  return prisma.card.findFirst({
    select: selectCardColumns,
    where: { hash, user_id },
  });
}

export function getCardWithMessages({
  hash,
  user_id,
}: Pick<card, "hash"> & {
  user_id: user["user_id"];
}) {
  return prisma.card.findFirst({
    select: {
      ...selectCardColumns,
      message: {
        select: {
          ...selectMessageColumns,
          color: { select: { hex: true } },
          font: { select: { name: true } },
        },
      },
    },
    where: { hash, user_id },
  });
}

export function getCardListItems({ user_id }: { user_id: user["user_id"] }) {
  return prisma.card.findMany({
    where: { user_id },
    select: selectCardColumns,
    orderBy: { updated_date: "desc" },
  });
}

interface createCardProps
  extends Pick<card, "card_template_id" | "from" | "to"> {
  user_id: user["user_id"];
}

export function createCard({
  user_id,
  card_template_id,
  from,
  to,
}: createCardProps) {
  return prisma.card.create({
    data: {
      hash: uuidv4(),
      from,
      to,
      card_template: {
        connect: {
          card_template_id,
        },
      },
      user: {
        connect: {
          user_id,
        },
      },
    },
  });
}

export function deleteCard({
  card_id,
}: Pick<card, "card_id"> & { user_id: user["user_id"] }) {
  return prisma.card.update({
    data: { deleted: "Y" },
    where: { card_id },
  });
}
