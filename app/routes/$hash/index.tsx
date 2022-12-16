import { AddComment } from "@mui/icons-material";
import { Button, Link } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import * as React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import invariant from "tiny-invariant";
import MessageCard from "~/components/MessageCard";
import PageHeader from "~/components/PageHeader";
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
    invariant(messageId, "Error");

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
      <PageHeader
        title={`From "${data.card.from}" to "${data.card.to}"`}
        actions={
          <Link component={RemixLink} underline="none" to="new">
            <Button startIcon={<AddComment />}>Message</Button>
          </Link>
        }
      />
      <div className="ViewCard__masonryContainer">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 300: 1, 375: 2, 700: 3, 1050: 4 }}
        >
          <Masonry gutter="10px">
            {data.card.message.map((message: any) => (
              <div key={message.message_id}>
                <MessageCard
                  message={message}
                  isOwner={data.userId === data.card.user_id}
                  key={message.message_id}
                />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </div>
  );
}
