import { ClassNames } from "@emotion/react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from "@mui/material";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getCardWithMessages } from "~/models/card.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/$hash.css";

export async function loader({ request, params }: LoaderArgs) {
  const user_id = await requireUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCardWithMessages({ user_id, hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card });
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function ViewCardPage() {
  const data = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <div className="ViewCard">
      <h3 className="text-2xl font-bold">{`From "${data.card.from}" to "${data.card.to}"`}</h3>
      <hr className="my-4" />
      <>
        {data.card.message.map((message) => (
          <Card
            variant="outlined"
            key={message.message_id}
            className="ViewPage__message"
          >
            <CardHeader title={`From: ${message.from}`} />
            <CardContent>
              <Typography>{message.text}</Typography>
            </CardContent>
            <CardMedia
              className="ViewPage__messageImage"
              component="img"
              src={message.image_url ?? undefined}
              alt="message image"
            />
          </Card>
        ))}
      </>
    </div>
  );
}
