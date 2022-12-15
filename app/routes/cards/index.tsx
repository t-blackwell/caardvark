import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import { Link } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import * as React from "react";
import TemplatePreview from "~/components/TemplatePreview";
import { getCardListItems } from "~/models/card.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/cards/cards.css";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const cardListItems = await getCardListItems({ user_id: userId });
  return json({ cardListItems });
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
export default function CardsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>
        <Link component={RemixLink} underline="none" to=".">
          My Cards
        </Link>
      </h1>
      <div>
        <Stack direction="row" spacing={2}>
          <Link
            component={RemixLink}
            underline="none"
            to="new"
            className="Cards__linkbutton"
          >
            <Button variant="outlined" startIcon={<AddToPhotosIcon />}>
              New Card
            </Button>
          </Link>
        </Stack>
        <hr />
        {data.cardListItems.length === 0 ? (
          <p>No cards yet</p>
        ) : (
          <div className="Wrapper">
            {data.cardListItems.map((card) => (
              <div className="Wrapper__template" key={card.card_id}>
                <TemplatePreview
                  // key={card.card_id}
                  text={card.card_template.text}
                  onClick={() => {
                    location = card.hash;
                  }}
                />
                <div className="Wrapper__text">To {card.to}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
