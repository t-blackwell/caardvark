import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import RichTextEditor from "~/components/RichTextEditor";
import type { Color, FontFamily } from "~/components/RichTextEditor";
import { getCard } from "~/models/card.server";
import { createMessage } from "~/models/message.server";
import { getSession, getSessionHeaders } from "~/session.server";
import styles from "~/styles/messages/new.css";
import { setSuccessMessage } from "~/toast-message.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.hash, "hash not found");

  const card = await getCard({ hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }

  // can't add message to a published card
  if (card.published_date !== null) {
    throw redirect(`/${card.hash}`);
  }

  return json({ card });
};

export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

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

    setSuccessMessage(session, "Message added.");

    return redirect(`/${hash}`, {
      headers: await getSessionHeaders(session),
    });
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
  const { card } = useLoaderData<typeof loader>();
  const errors = useActionData();

  const [imageUrl, setImageUrl] = React.useState<string>();
  const [color, setColor] = React.useState<Color>("#000");
  const [fontFamily, setFontFamily] = React.useState<FontFamily>("Arial");

  return (
    <Container className="AddMessage">
      <Form className="AddMessage__box" method="post">
        <Typography className="AddMessage__title" variant="h5">
          Add Message
        </Typography>

        <input name="font" value={fontFamily} hidden />
        <input name="color" value={color} hidden />

        <RichTextEditor
          autoFocus
          color={color}
          fontFamily={fontFamily}
          fullWidth
          name="text"
          placeholder="Start typing message..."
          required
          setColor={setColor}
          setFontFamily={setFontFamily}
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
        <input type="hidden" name="hash" value={card.hash} />
        <input type="hidden" name="card_id" value={card.card_id} />
        <Button
          color="primary"
          className="AddMessage__button"
          type="submit"
          variant="contained"
        >
          Add message
        </Button>
        <Typography className="AddMessage__backLink" variant="caption">
          <Link component={RemixLink} to={`/${card.hash}`} underline="hover">
            <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
            Go back to card
          </Link>
        </Typography>
      </Form>
    </Container>
  );
}
