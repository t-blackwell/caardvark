import { Box, Button, Container, TextField, Typography } from "@mui/material";
import type {
  ActionArgs,
  LoaderArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import RichTextEditor from "~/components/RichTextEditor";
import type { Color, FontFamily } from "~/components/RichTextEditor";
import { getCard } from "~/models/card.server";
import { createMessage } from "~/models/message.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/messages/new.css";

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCard({ request, hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ card });
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text")?.toString();
  const from = formData.get("from")?.toString();
  const hash = formData.get("hash")?.toString();
  const card_id = Number(formData.get("card_id"));
  const color = formData.get("color")?.toString();
  const font = formData.get("font")?.toString();
  const imageUrl = formData.get("imageUrl")?.toString();

  invariant(!isNaN(card_id), "card not found");

  const errors = {
    text:
      typeof text !== "string" || text.length === 0
        ? "Message is required"
        : undefined,
    from:
      typeof from !== "string" || from.length === 0
        ? "From is required"
        : undefined,
  };

  if (
    Object.values(errors).every((error) => error === undefined) &&
    typeof text === "string" &&
    typeof from === "string" &&
    typeof color === "string" &&
    typeof font === "string"
  ) {
    await createMessage({
      text,
      from,
      color,
      font,
      card_id,
      image_url: imageUrl ?? null,
    });
    return redirect(`/${hash}`);
  } else return errors;
}

export const meta: MetaFunction = () => {
  return {
    title: "Add Message",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewMessagePage() {
  const loaderData = useLoaderData<typeof loader>();
  const errors = useActionData();

  const [imageUrl, setImageUrl] = React.useState<string>();
  const [color, setColor] = React.useState<Color>("#000");
  const [fontFamily, setFontFamily] = React.useState<FontFamily>("Arial");

  const textRef = React.useRef<HTMLInputElement>(null);

  return (
    <Container className="AddMessage">
      <Form
        className="AddMessage__box"
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Typography className="AddMessage__title" variant="h5">
          Add Message
        </Typography>

        <input name="font" value={fontFamily} hidden />
        <input name="color" value={color} hidden />

        <RichTextEditor
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          color={color}
          setColor={setColor}
          name="text"
        />
        {errors?.text !== undefined ? (
          <Typography className="AddMessage__inlineError" variant="caption">
            {errors.text}
          </Typography>
        ) : undefined}
        <TextField
          className="AddMessage__input"
          error={errors?.imageUrl !== undefined}
          helperText={errors?.imageUrl}
          id="imageUrl"
          label="Image URL"
          name="imageUrl"
          size="small"
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl !== undefined ? <Box component="img" src={imageUrl} /> : null}
        <TextField
          className="AddMessage__input"
          error={errors?.from !== undefined}
          helperText={errors?.from}
          id="from"
          label="From"
          name="from"
          required
          size="small"
        />
        <input type="hidden" name="hash" value={loaderData.card.hash} />
        <input type="hidden" name="card_id" value={loaderData.card.card_id} />
        <Button
          color="primary"
          className="AddMessage__button"
          type="submit"
          variant="contained"
        >
          Add message
        </Button>
      </Form>
    </Container>
  );
}
