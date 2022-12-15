import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteCard, getCard, publishCard } from "~/models/card.server";

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
    case "publish":
      return await publishCard({ request, card_id: cardId });
  }
}

export default function CardDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3>{`From "${data.card.from}" to "${data.card.to}"`}</h3>
      <p>{`card_template_id = ${data.card.card_template_id} `}</p>
      <p>{`created_date = ${data.card.created_date}`}</p>
      <p>{`updated_date = ${data.card.updated_date}`}</p>
      <p>{`published_date = ${data.card.published_date}`}</p>
      <p>{`deleted = ${data.card.deleted}`}</p>
      <hr />
      <Form method="post">
        <input type="hidden" name="card_id" value={data.card.card_id} />
        <button
          type="submit"
          name="_action"
          value="delete"
          disabled={data.card.deleted === "Y"}
        >
          Delete
        </button>
        <button
          type="submit"
          name="_action"
          value="publish"
          disabled={data.card.published_date !== null}
        >
          Publish
        </button>
      </Form>
      <Link to={`/${data.card.hash}`}>View Card</Link>
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
