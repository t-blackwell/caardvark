import type { card, user } from "@prisma/client";

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
}

export function getCard({
  card_id,
  user_id,
}: Pick<card, "card_id"> & {
  user_id: user["user_id"];
}) {
  return prisma.card.findFirst({
    select: selectCardColumns,
    where: { card_id, user_id },
  });
}

export function getCardListItems({ user_id }: { user_id: user["user_id"] }) {
  return prisma.card.findMany({
    where: { user_id },
    select: selectCardColumns,
    orderBy: { updated_date: "desc" },
  });
}

interface createCardProps extends Pick<card, "card_template_id" | "from" | "to"> {
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
      // TODO: replace with a proper hash
      hash: Math.random().toString(),
      from,
      to,
      user: {
        connect: {
          user_id,
        },
      },
      card_template: {
        connect: {
          card_template_id,
        },
      },
    },
  });
}

export function deleteCard({
  card_id,
}: Pick<card, "card_id"> & { user_id: user["user_id"] }) {
  return prisma.card.update({
    data: {deleted: 'Y'},
    where: { card_id },
  });
}
