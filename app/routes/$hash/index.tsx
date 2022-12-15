import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getCardWithMessages } from "~/models/card.server";
import { deleteMessage } from "~/models/message.server";
import { getUserId } from "~/session.server";
import styles from "~/styles/messages/index.css";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await getUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCardWithMessages({ hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card, userId: userId });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const messageId = formData.get("messageId");
    const cardOwnerId = formData.get("cardOwnerId");
    invariant(messageId, "Error");
    invariant(cardOwnerId, "Error");

    await deleteMessage({
      request,
      message_id: Number(messageId),
    });
  }
  return redirect(".");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function ViewCardPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="ViewCard">
      <Link className="ViewCard__addMessageLink" to="new">
        <Button className="ViewCard__addMessageButton">Add message</Button>
      </Link>
      <h3 className="text-2xl font-bold">{`From "${data.card.from}" to "${data.card.to}"`}</h3>
      <hr className="my-4" />
      <div className="ViewCard__messageContainer">
        {data.card.message.map((message) => (
          <Card
            variant="outlined"
            key={message.message_id}
            className="ViewCard__message"
          >
            <div className="ViewCard__messageTitleContainer">
              <CardHeader
                title={`From: ${message.from}`}
                action={
                  data.card.user_id === data.userId ? (
                    <Form method="post">
                      <IconButton type="submit" name="_action" value="delete">
                        <input
                          type="hidden"
                          name="messageId"
                          value={message.message_id}
                        />
                        <input
                          type="hidden"
                          name="cardOwnerId"
                          value={data.card.user_id}
                        />
                        <DeleteIcon />
                      </IconButton>
                    </Form>
                  ) : (
                    <></>
                  )
                }
              />
            </div>
            <CardContent>
              <Typography
                color={message.color.hex ?? undefined}
                fontFamily={message.font.name ?? undefined}
              >
                {message.text}
              </Typography>
            </CardContent>
            {message.image_url !== null ? (
              <CardMedia
                component="img"
                src={message.image_url}
                alt="message image"
              />
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
