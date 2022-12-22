import { Share } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import SouthIcon from "@mui/icons-material/South";
import { IconButton, Container, Link, Typography } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link as RemixLink,
  useFetcher,
  useSearchParams,
} from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";
import Masonry from "react-smart-masonry";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import AddMessageDialog from "~/components/AddMessageDialog";
import MessageCard from "~/components/MessageCard";
import Page from "~/components/Page";
import ScrollButton from "~/components/ScrollButton";
import ShareLinkDialog, { copyLinkAction } from "~/components/ShareLinkDialog";
import TemplatePreview from "~/components/TemplatePreview";
import { getCardWithMessages } from "~/models/card.server";
import { createMessage, deleteMessage } from "~/models/message.server";
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

    case "add":
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
        // TODO: #pageEnd not working but unsure why.
        return redirect(`/${hash}#pageEnd`, {
          headers: await getSessionHeaders(session),
        });
      } else {
        return errors;
      }
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

  const [searchParams, setSearchParams] = useSearchParams();
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
              onClick={() => setSearchParams({ add_message: "true" })}
              title="Add Message"
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
                onClick={() => setSearchParams({ add_message: "true" })}
                variant="contained"
              />
            </Container>
          ) : null}
        </div>
        <div id="pageEnd" />
      </div>
      <AddMessageDialog
        isOpen={searchParams.get("add_message") === "true"}
        onClose={() => setSearchParams({})}
        cardHash={data.card.hash}
        cardId={data.card.card_id}
      />
    </Page>
  );
}
