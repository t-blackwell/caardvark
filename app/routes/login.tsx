import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import Logo from "~/components/Logo";
import Page from "~/components/Page";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import styles from "~/styles/login.css";
import { safeRedirect, validateEmail } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Password is required", email: null } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { password: "Password is too short", email: null } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.user_id.toString(),
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Log in · Caardvark",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/cards";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Page className="Login" maxWidth="xs">
      <Box className="Login__logo">
        <Logo size="medium" />
      </Box>
      <Form className="Login__box" method="post" noValidate>
        <Typography className="Login__title" variant="h5">
          Log in
        </Typography>
        <TextField
          autoComplete="email"
          autoFocus={true}
          className="Login__input"
          error={actionData?.errors?.email !== undefined}
          helperText={actionData?.errors?.email}
          id="email"
          label="Email address"
          name="email"
          ref={emailRef}
          required
          type="email"
        />

        <TextField
          autoComplete="current-password"
          className="Login__input"
          error={actionData?.errors?.password !== undefined}
          helperText={actionData?.errors?.password}
          id="password"
          label="Password"
          name="password"
          ref={passwordRef}
          type="password"
        />

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <FormControlLabel
          control={<Checkbox defaultChecked name="remember" size="small" />}
          label="Remember me"
        />

        <Button
          className="Login__button"
          color="primary"
          disableElevation
          type="submit"
          variant="contained"
        >
          Log in
        </Button>
        <Typography variant="caption">
          Don't have an account?{" "}
          <Link
            component={RemixLink}
            to={{
              pathname: "/signup",
              search: searchParams.toString(),
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Form>
    </Page>
  );
}
