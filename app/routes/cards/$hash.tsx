import { Button, TextField } from "@mui/material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  deleteCard,
  getCard,
  publishCard,
  updateCard,
} from "~/models/card.server";

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

export default function CardDetailsPage() {
  const { card } = useLoaderData<typeof loader>();

  // can't figure out how to narrow the type of this.
  // use optional chaining for some protection
  const actionData = useActionData();

  return (
    <div>
      <Form method="post">
        <input type="hidden" name="card_id" value={card.card_id} />
        <TextField
          autoFocus
          defaultValue={card.to}
          error={actionData?.errors?.to}
          helperText={actionData?.errors?.to}
          label="To"
          name="to"
          type="text"
        />
        <TextField
          defaultValue={card.from}
          error={actionData?.errors?.from !== undefined}
          helperText={actionData?.errors?.from}
          label="From"
          name="from"
          type="text"
        />

        <p>{`card_template_id = ${card.card_template_id} `}</p>
        <p>{`created_date = ${card.created_date}`}</p>
        <p>{`updated_date = ${card.updated_date}`}</p>
        <p>{`published_date = ${card.published_date}`}</p>
        <p>{`deleted = ${card.deleted}`}</p>
        <Button
          type="submit"
          name="_action"
          value="update"
          disabled={card.deleted === "Y" || card.published_date !== null}
        >
          Update
        </Button>
        <Button
          type="submit"
          name="_action"
          value="publish"
          disabled={card.deleted === "Y" || card.published_date !== null}
        >
          Publish
        </Button>
        <Button
          type="submit"
          name="_action"
          value="delete"
          disabled={card.deleted === "Y"}
        >
          Delete
        </Button>
      </Form>
      <Link to={`/${card.hash}`}>View Card</Link>
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
