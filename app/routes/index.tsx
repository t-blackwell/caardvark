import { Typography } from "@mui/material";
import ActionButton from "~/components/ActionButton";
import { HeroBanner } from "~/components/HeroBanner";
import Page from "~/components/Page";
import styles from "~/styles/index.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Index() {
  return (
    <Page className="Home">
      <HeroBanner
        title="Send greeting cards online"
        subtitle={
          <div className="Home__bannerSubtitle">
            <Typography color="text.secondary">
              Create personalised cards for friends and family for{" "}
              <strong>free</strong>.
            </Typography>
            <img
              className="Home__bannerImage"
              src="/assets/undraw_personal_text_re_vqj3.svg"
              alt="person with messages"
            />
            <ActionButton variant="outlined" title="View sample" to="/sample" />
          </div>
        }
      />
    </Page>
  );
}
