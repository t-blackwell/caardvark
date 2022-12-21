import { Share } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import SouthIcon from "@mui/icons-material/South";
import { IconButton, Container, Link, Typography } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useFetcher } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";
import Masonry from "react-smart-masonry";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import MessageCard from "~/components/MessageCard";
import Page from "~/components/Page";
import ScrollButton from "~/components/ScrollButton";
import ShareLinkDialog, { copyLinkAction } from "~/components/ShareLinkDialog";
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
  const _action = formData.get("_action");

  switch (_action) {
    // copy
    case "copy":
      return copyLinkAction(request);

    // delete
    case "delete":
      const messageId = formData.get("messageId");
      invariant(messageId, "Error");

      await deleteMessage({
        request,
        message_id: Number(messageId),
      });

      setSuccessMessage(session, "Message deleted.");
      return redirect(".", {
        headers: await getSessionHeaders(session),
      });
  }

  throw new Error(`Action ${_action} not recognised`);
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
  const isPublished = data.card.published_date !== null;
  const isSample = data.card.hash === "sample";

  const fetcher = useFetcher();

  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const onShareCopy = () => {
    fetcher.submit({ _action: "copy" }, { method: "post" });
  };

  return (
    <Page
      className="ViewCard"
      infoBarContent={
        isSample ? (
          <Typography>
            This is a sample card -{" "}
            <Link
              className="ViewCard__infoBarLink"
              component={RemixLink}
              underline="none"
              to="/cards/new"
            >
              create your own!
            </Link>{" "}
          </Typography>
        ) : undefined
      }
      maxWidth="xl"
      pageHeaderActions={
        <>
          {!isPublished ? (
            <ActionButton
              icon={<AddIcon />}
              title="Add Message"
              to="new"
              variant="outlined"
            />
          ) : null}
          <ActionButton
            icon={<Share />}
            onClick={() => setIsShareDialogOpen(true)}
            title="Share"
            variant="outlined"
          />
        </>
      }
      pageHeaderTitle={`From "${data.card.from}" to "${data.card.to}"`}
    >
      <fetcher.Form>
        <ShareLinkDialog
          hash={data.card.hash}
          onClose={() => setIsShareDialogOpen(false)}
          onCopy={onShareCopy}
          open={isShareDialogOpen}
        />
      </fetcher.Form>

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
                  deleteAllowed={
                    data.userId === data.card.user_id && !isPublished
                  }
                  key={message.message_id}
                />
              </div>
            ))}
          </Masonry>
          {!isPublished ? (
            <Container maxWidth="xs" sx={{ my: 2 }}>
              <ActionButton
                fullWidth
                title="Add message"
                to="new"
                variant="contained"
              />
            </Container>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
