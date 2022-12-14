import { Button, Container, TextField, Typography } from "@mui/material";
import type { ActionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { createMessage } from "~/models/message.server";
import styles from "~/styles/messages/new.css";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text")?.toString();
  invariant(text, "text not found");
  const from = formData.get("from")?.toString();
  invariant(from, "from not found");
  const card_id = Number(formData.get("card_id"));
  invariant(!isNaN(card_id), "card not found");
  const color_id = Number(formData.get("color_id"));
  invariant(!isNaN(color_id), "color not found");
  const font_id = Number(formData.get("font_id"));
  invariant(!isNaN(font_id), "font not found");

  const errors = {
    text:
      typeof text !== "string" || text.length === 0
        ? "text is required"
        : undefined,
    from:
      typeof from !== "string" || from.length === 0
        ? "from is required"
        : undefined,
    color_id: typeof color_id !== "number" ? "color_id is required" : undefined,
    font_id: typeof font_id !== "number" ? "font_id is required" : undefined,
    card_id: typeof card_id !== "number" ? "card_id is required" : undefined,
  };

  if (Object.values(errors).every((error) => error === undefined)) {
    const message = await createMessage({
      text,
      from,
      color_id: 1,
      font_id: 1,
      card_id: 1,
    });
    return redirect(`/${message.card_id}`);
  } else return errors;
}

export const meta: MetaFunction = () => {
  return {
    title: "Create Message",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewMessagePage() {
  const errors = useActionData();
  const fromRef = React.useRef<HTMLInputElement>(null);
  const textRef = React.useRef<HTMLInputElement>(null);

  return (
    <Container className="CreateMessage">
      <Form
        className="CreateMessage__box"
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Typography className="CreateMessage__title" variant="h5">
          Create Message
        </Typography>
        <TextField
          autoFocus
          className="CreateMessage__input"
          error={errors?.text !== undefined}
          helperText={errors?.text}
          id="text"
          label="Message"
          multiline
          name="text"
          ref={textRef}
          required
          size="small"
        />

        <TextField
          autoFocus
          className="CreateMessage__input"
          error={errors?.from !== undefined}
          helperText={errors?.from}
          id="from"
          label="From"
          name="from"
          ref={fromRef}
          required
          size="small"
        />

        <Button className="CreateMessage__button" type="submit">
          Save
        </Button>
      </Form>
    </Container>
  );
}
