import { Button } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import * as React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import invariant from "tiny-invariant";
import MessageCard from "~/components/MessageCard";
import { getCardWithMessages } from "~/models/card.server";
import { deleteMessage } from "~/models/message.server";
import { getUserId } from "~/session.server";

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
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry>
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
