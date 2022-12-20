import { AddComment } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import SouthIcon from "@mui/icons-material/South";
import { IconButton, Card, CardContent, Link, Typography } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import * as React from "react";
import Masonry from "react-smart-masonry";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import MessageCard from "~/components/MessageCard";
import PageHeader from "~/components/PageHeader";
import ScrollButton from "~/components/ScrollButton";
import TemplatePreview from "~/components/TemplatePreview";
import { getCardWithMessages } from "~/models/card.server";
import { deleteMessage } from "~/models/message.server";
import { getSession, getSessionHeaders, getUserId } from "~/session.server";
import styles from "~/styles/messages/index.css";
import { setSuccessMessage } from "~/toast-message.server";

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
  const session = await getSession(request);

  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const messageId = formData.get("messageId");
    invariant(messageId, "Error");

    await deleteMessage({
      request,
      message_id: Number(messageId),
    });

    setSuccessMessage(session, "Message deleted.");
  }

  return redirect(".", {
    headers: await getSessionHeaders(session),
  });
}

export function handleScrollDown() {
  const scrolled = document.documentElement.scrollTop;
  const items = window.document.getElementsByClassName(
    "ViewCard__messageContainer"
  );
  const elDistanceToTop =
    window.pageYOffset + items[0].getBoundingClientRect().top;

  window.scrollTo({
    top:
      Math.round(elDistanceToTop) > Math.round(scrolled + 1)
        ? elDistanceToTop
        : undefined,
    behavior: "smooth",
  });
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
          <ActionButton
            icon={<AddIcon />}
            title="Add Message"
            to="new"
            variant="outlined"
          />
        }
      />
      <div className="ViewCard__templateContainer">
        <TemplatePreview
          size="large"
          backgroundCss={
            data.card.card_template.bg_css !== null
              ? (JSON.parse(
                  data.card.card_template.bg_css
                ) as React.CSSProperties)
              : undefined
          }
          textCss={
            data.card.card_template.text_css !== null
              ? (JSON.parse(
                  data.card.card_template.text_css
                ) as React.CSSProperties)
              : undefined
          }
          text={data.card.card_template.text ?? ""}
        />
        <IconButton
          className="ScrollDownButton"
          sx={{ mt: 2 }}
          onClick={handleScrollDown}
        >
          <SouthIcon fontSize="large" />
        </IconButton>
        <ScrollButton />
      </div>
      <div className="ViewCard__messageContainer">
        <div id="messages" className="ViewCard__masonryContainer">
          <Masonry
            autoArrange
            breakpoints={{ xs: 0, sm: 450, md: 700, lg: 1050 }}
            columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            gap="20px"
          >
            {data.card.message.map((message: any) => (
              <div key={message.message_id}>
                <MessageCard
                  message={message}
                  isOwner={data.userId === data.card.user_id}
                  key={message.message_id}
                />
              </div>
            ))}
            <Link component={RemixLink} underline="none" to="new">
              <Card className="ViewCard__addMessage" variant="outlined">
                <CardContent>
                  <AddComment sx={{ fontSize: 100 }} />
                  <Typography>Add Message</Typography>
                </CardContent>
              </Card>
            </Link>
          </Masonry>
        </div>
      </div>
    </div>
  );
}
