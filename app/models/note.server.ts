import type { user, note } from "@prisma/client";

import { prisma } from "~/db.server";

export type { note } from "@prisma/client";

export function getNote({
  note_id,
  user_id,
}: Pick<note, "note_id"> & {
  user_id: user["user_id"];
}) {
  return prisma.note.findFirst({
    select: { note_id: true, body: true, title: true },
    where: { note_id, user_id },
  });
}

export function getNoteListItems({ user_id }: { user_id: user["user_id"] }) {
  return prisma.note.findMany({
    where: { user_id },
    select: { note_id: true, title: true },
    orderBy: { updated_date: "desc" },
  });
}

export function createNote({
  body,
  title,
  user_id,
}: Pick<note, "body" | "title"> & {
  user_id: user["user_id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          user_id,
        },
      },
    },
  });
}

export function deleteNote({
  note_id,
  user_id,
}: Pick<note, "note_id"> & { user_id: user["user_id"] }) {
  return prisma.note.deleteMany({
    where: { note_id, user_id },
  });
}
