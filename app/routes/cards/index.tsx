import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import { getCardListItems } from "~/models/card.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const cardListItems = await getCardListItems({ user_id: userId });
  return json({ cardListItems });
}

export default function CardsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>
        <Link to=".">Cards</Link>
      </h1>
      <div>
        <Link to="new">+ New Card</Link>
        <hr />
        {data.cardListItems.length === 0 ? (
          <p>No cards yet</p>
        ) : (
          <ol>
            {data.cardListItems.map((card) => (
              <li key={card.card_id}>
                <NavLink to={card.hash}>
                  {`From "${card.from}" to "${card.to}"`}
                </NavLink>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
