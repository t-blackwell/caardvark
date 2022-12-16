import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Button, TextField, Typography } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import TemplatePreview from "~/components/TemplatePreview";
import {
  deleteCard,
  getCard,
  publishCard,
  updateCard,
} from "~/models/card.server";
import styles from "~/styles/cards/$hash.css";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.hash, "hash not found");

  const card = await getCard({ request, hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ card });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const cardId = Number(formData.get("card_id"));
  invariant(!isNaN(cardId), "card not found");

  const { _action } = Object.fromEntries(formData);

  switch (_action) {
    case "delete":
      await deleteCard({ request, card_id: cardId });
      return redirect("/cards");
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
      return await updateCard({ request, card_id: cardId, from, to });
    case "publish":
      return await publishCard({ request, card_id: cardId });
  }
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function CardDetailsPage() {
  const { card } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // can't figure out how to narrow the type of this.
  // use optional chaining for some protection
  const actionData = useActionData();

  const isDeleted = card.deleted === "Y";
  const isPublished = card.published_date !== null;
  return (
    <div className="CardDetails">
      <div className="CardDetails__formContainer">
        <Form method="post" className="CardDetails__form">
          <input type="hidden" name="card_id" value={card.card_id} />
          <Typography className="CardDetails__title" variant="h5">
            Edit Card
          </Typography>
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
          </div>

          <div className="CardDetails__actionsContainer">
            <Button
              disabled={isDeleted || isPublished}
              name="_action"
              type="submit"
              value="update"
            >
              Update
            </Button>
            <Button
              disabled={isDeleted || isPublished}
              endIcon={isPublished ? <CheckCircleIcon color="success" /> : null}
              name="_action"
              type="submit"
              value="publish"
            >
              Publish
            </Button>
            <Button
              disabled={isDeleted}
              endIcon={isDeleted ? <CheckCircleIcon color="success" /> : null}
              name="_action"
              type="submit"
              value="delete"
            >
              Delete
            </Button>
          </div>
        </Form>
      </div>

      <div className="CardDetails__templateContainer">
        {/* <Link to={`/${card.hash}`}>
          <Launch></Launch>
        </Link> */}

        <TemplatePreview
          className="CardDetails__template"
          onClick={() => navigate(`/${card.hash}`)}
          text={card.card_template.text ?? ""}
          textCss={
            card.card_template.text_css !== null
              ? (JSON.parse(card.card_template.text_css) as React.CSSProperties)
              : undefined
          }
          backgroundCss={
            card.card_template.bg_css !== null
              ? (JSON.parse(card.card_template.bg_css) as React.CSSProperties)
              : undefined
          }
        />
      </div>
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
