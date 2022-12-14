import { v4 as uuidv4 } from 'uuid';
import type { card } from "@prisma/client";

import { prisma } from "~/db.server";

export type { card } from "@prisma/client";

export function createCard({
  card_template_id,
  from,
  to,
  user_id,
}: Pick<card, "card_template_id" | "from" | "to" | "user_id">) {

  return prisma.card.create({
    data: {
      card_template_id,
      from,
      to,
      user_id,
      hash: uuidv4(),
      created_date: new Date(),
    },
  });
}