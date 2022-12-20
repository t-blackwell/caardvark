import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import { Button, Link, TextField, Typography } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Link as RemixLink } from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import ConfirmActionDialog from "~/components/ConfirmActionDialog";
import PageHeader from "~/components/PageHeader";
import TemplatePreview from "~/components/TemplatePreview";
import {
  deleteCard,
  getCard,
  publishCard,
  updateCard,
} from "~/models/card.server";
import { getSession, getSessionHeaders } from "~/session.server";
import styles from "~/styles/cards/$hash.css";
import { setSuccessMessage } from "~/toast-message.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.hash, "hash not found");

  const card = await getCard({ request, hash: params.hash });
  if (card === null) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.hash, "hash not found");

  const session = await getSession(request);

  const formData = await request.formData();
  const cardId = Number(formData.get("card_id"));
  invariant(!isNaN(cardId), "card not found");

  const { _action } = Object.fromEntries(formData);

  switch (_action) {
    // delete
    case "delete":
      await deleteCard({ request, card_id: cardId });

      setSuccessMessage(session, "Card deleted.");

      return redirect("/cards", {
        headers: await getSessionHeaders(session),
      });

    // update
    case "update":
      const to = formData.get("to");
      const from = formData.get("from");

      const toError = typeof to !== "string" || to.length === 0;
      const fromError = typeof from !== "string" || from.length === 0;

      if (toError || fromError) {
        return json(
          {
            errors: {
              to: toError ? "to is required" : null,
              from: fromError ? "from is required" : null,
            },
          },
          { status: 400 }
        );
      }

      await updateCard({ request, card_id: cardId, from, to });

      setSuccessMessage(session, "Card updated.");

      return redirect("", {
        headers: await getSessionHeaders(session),
      });

    // publish
    case "publish":
      await publishCard({ request, card_id: cardId });

      setSuccessMessage(session, "Card sent.");

      return redirect("", {
        headers: await getSessionHeaders(session),
      });
  }

  throw new Error(`Action ${action} not recognised`);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function CardDetailsPage() {
  const { card } = useLoaderData<typeof loader>();
  const isDeleted = card.deleted === "Y";
  const isPublished = card.published_date !== null;

  // can't figure out how to narrow the type of `actionData<typeof action>`.
  // use optional chaining for minimal protection
  const actionData = useActionData();

  const navigate = useNavigate();

  const fetcher = useFetcher();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const onConfirmDelete = () => {
    fetcher.submit(
      { _action: "delete", card_id: card.card_id.toString() },
      { method: "post" }
    );
  };

  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);
  const onConfirmPublish = () => {
    fetcher.submit(
      { _action: "publish", card_id: card.card_id.toString() },
      { method: "post" }
    );
    setIsPublishDialogOpen(false);
  };

  return (
    <div className="CardDetails">
      <fetcher.Form>
        <ConfirmActionDialog
          actionName="Yes, delete this card"
          actionColorTheme="error"
          isOpen={isDeleteDialogOpen}
          message="Are you sure you want to delete this card?"
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={onConfirmDelete}
        />
        <ConfirmActionDialog
          actionName="Yes, send this card"
          actionColorTheme="primary"
          isOpen={isPublishDialogOpen}
          message="Are you sure you want to send this card?"
          onClose={() => setIsPublishDialogOpen(false)}
          onConfirm={onConfirmPublish}
        />
      </fetcher.Form>
      <Form method="post">
        <input type="hidden" name="card_id" value={card.card_id} />
        <PageHeader
          title="Edit Card"
          actions={
            <>
              <ActionButton
                icon={<ReplyIcon />}
                title="Back"
                to="/cards"
                variant="outlined"
              />
              <ActionButton
                color="error"
                disabled={isDeleted}
                icon={<DeleteIcon />}
                onClick={() => setIsDeleteDialogOpen(true)}
                title="Delete"
                value="delete"
                variant="contained"
              />
              <ActionButton
                disabled={isDeleted || isPublished}
                icon={<SendIcon />}
                onClick={() => setIsPublishDialogOpen(true)}
                title={isPublished ? "Sent" : "Send"}
                value="publish"
                variant="contained"
              />
            </>
          }
        />

        <div className="CardDetails__pageContent">
          <div className="CardDetails__inputsContainer">
            <div className="CardDetails__fieldsContainer">
              <TextField
                autoFocus
                className="CardDetails__field"
                disabled={isDeleted || isPublished}
                defaultValue={card.to}
                error={actionData?.errors?.to}
                helperText={actionData?.errors?.to}
                label="To"
                name="to"
                type="text"
              />
              <TextField
                className="CardDetails__field"
                defaultValue={card.from}
                disabled={isDeleted || isPublished}
                error={actionData?.errors?.from !== undefined}
                helperText={actionData?.errors?.from}
                label="From"
                name="from"
                type="text"
              />
            </div>

            <Button
              disabled={isDeleted || isPublished}
              name="_action"
              type="submit"
              value="update"
              variant="contained"
            >
              Save Changes
            </Button>
          </div>
          <div className="CardDetails__templateContainer">
            <TemplatePreview
              backgroundCss={
                card.card_template.bg_css !== null
                  ? (JSON.parse(
                      card.card_template.bg_css
                    ) as React.CSSProperties)
                  : undefined
              }
              className="CardDetails__template"
              onClick={() => navigate(`/${card.hash}`)}
              size="medium"
              text={card.card_template.text ?? ""}
              textCss={
                card.card_template.text_css !== null
                  ? (JSON.parse(
                      card.card_template.text_css
                    ) as React.CSSProperties)
                  : undefined
              }
            />
            <Link component={RemixLink} to={`/${card.hash}`} underline="none">
              <Typography>View messages</Typography>
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Card not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
