import AddIcon from "@mui/icons-material/Add";
import { Typography } from "@mui/material";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import * as React from "react";
import ActionButton from "~/components/ActionButton";
import Page from "~/components/Page";
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
  const navigate = useNavigate();

  return (
    <Page
      className="Cards"
      pageHeaderActions={
        <ActionButton
          icon={<AddIcon />}
          title="Create New Card"
          to="new"
          variant="outlined"
        />
      }
      pageHeaderTitle="My Cards"
    >
      {data.cardListItems.length === 0 ? (
        <div className="Cards__noDataFound">
          <Typography variant="h5">
            You haven't created any cards yet.
          </Typography>
          <ActionButton size="small" title="Create new card" to="new" />
        </div>
      ) : (
        <div className="Cards__grid">
          {data.cardListItems.map((card) => (
            <div className="Cards__template" key={card.card_id}>
              <TemplatePreview
                backgroundCss={
                  card.card_template.bg_css !== null
                    ? (JSON.parse(
                        card.card_template.bg_css
                      ) as React.CSSProperties)
                    : undefined
                }
                textCss={
                  card.card_template.text_css !== null
                    ? (JSON.parse(
                        card.card_template.text_css
                      ) as React.CSSProperties)
                    : undefined
                }
                text={card.card_template.text ?? ""}
                onClick={() => {
                  navigate(`/cards/${card.hash}`);
                }}
              />
              <Typography className="Cards__text" color="text.secondary">
                {card.to}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
