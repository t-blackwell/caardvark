import type { card_type } from "@prisma/client";

import { prisma } from "~/db.server";

export type { card_type } from "@prisma/client";

export function getCardType({
  card_type_id,
}: Pick<card_type, "card_type_id">) {
  return prisma.card_type.findFirst({
    select: { card_type_id: true, name: true },
    where: { card_type_id },
  });
}

export function getCardTypes() {
  return prisma.card_type.findMany({
    select: { card_type_id: true, name: true },
  });
}




