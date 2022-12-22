import { Box, Typography } from "@mui/material";
import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Logo from "~/components/Logo";
import Page from "~/components/Page";
import { getUserId, getEmailVerify } from "~/session.server";
import styles from "~/styles/verify.css";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId !== undefined) {
    return redirect("/");
  }

  const emailVerify = await getEmailVerify(request);
  if (emailVerify === undefined) {
    return redirect("/");
  }

  return json({ emailVerify });
}

export const meta: MetaFunction = () => {
  return {
    title: "Verify · Caardvark",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function VerifyPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page className="Verify" maxWidth="xs">
      <Box className="Verify__logo">
        <Logo size="medium" />
      </Box>
      <Form className="Verify__box" method="post" noValidate>
        <Typography className="Verify__title" variant="h5">
          Verify your email
        </Typography>
        <Typography>We sent an email to:</Typography>
        <Typography variant="h6">
          <strong>{data.emailVerify}</strong>
        </Typography>
        <Typography>
          Click the link in the email to verify your email address and start
          creating cards!
        </Typography>
      </Form>
    </Page>
  );
}
