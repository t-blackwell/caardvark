import AddIcon from "@mui/icons-material/Add";
import { Link } from "@mui/material";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link as RemixLink,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import ActionButton from "~/components/ActionButton";
import PageHeader from "~/components/PageHeader";
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
    <div className="Cards">
      <PageHeader
        title="My Cards"
        actions={
          <ActionButton
            icon={<AddIcon />}
            title="Create New Card"
            to="new"
            variant="outlined"
          />
        }
      />
      <div>
        {data.cardListItems.length === 0 ? (
          <p>
            You do not have any cards yet. Create one{" "}
            <Link component={RemixLink} to="new" underline="none">
              here
            </Link>
            .
          </p>
        ) : (
          <div className="Wrapper">
            {data.cardListItems.map((card) => (
              <div className="Wrapper__template" key={card.card_id}>
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
                <div className="Wrapper__text">To: {card.to}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
