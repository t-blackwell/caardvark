import DeleteIcon from "@mui/icons-material/Delete";
import { Button, TextField } from "@mui/material";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import React from "react";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import ConfirmActionDialog from "~/components/ConfirmActionDialog";
import Page from "~/components/Page";
import { deleteUserByEmail, updateUser } from "~/models/user.server";
import { getSession, getSessionHeaders, logout } from "~/session.server";
import styles from "~/styles/profile.css";
import { setSuccessMessage } from "~/toast-message.server";
import { useUser, validateEmail } from "~/utils";

export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

  const formData = await request.formData();
  const email = formData.get("email");
  const { _action } = Object.fromEntries(formData);

  switch (_action) {
    case "delete":
      invariant(validateEmail(email), "user not found");
      await deleteUserByEmail(email);
      return logout(request);
    case "update":
      const first = formData.get("first_name");
      const last = formData.get("last_name");
      const emailError = !validateEmail(email);

      if (emailError) {
        return json(
          {
            errors: {
              email: emailError ? "valid email address is required" : null,
            },
          },
          { status: 400 }
        );
      }
      invariant(typeof first === "string" || first === null, "Error");
      invariant(typeof last === "string" || last === null, "Error");
      invariant(typeof email === "string", "Error");

      await updateUser({
        request,
        email,
        first_name: first?.trim() === "" ? null : first,
        last_name: last?.trim() === "" ? null : last,
      });

      setSuccessMessage(session, "Profile updated.");

      return redirect("", {
        headers: await getSessionHeaders(session),
      });
  }
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function ProfilePage() {
  const user = useUser();

  const actionData = useActionData();

  const [isOpen, setIsOpen] = React.useState(false);

  const fetcher = useFetcher();

  const onConfirmDelete = () => {
    fetcher.submit(
      { _action: "delete", email: user.email },
      { method: "post" }
    );
    setIsOpen(false);
  };

  return (
    <Page
      className="Profile"
      maxWidth="md"
      pageHeaderActions={
        <ActionButton
          color="error"
          icon={<DeleteIcon />}
          title="Delete"
          onClick={() => setIsOpen(true)}
          variant="contained"
        />
      }
      pageHeaderTitle="Profile"
    >
      <fetcher.Form method="post">
        <ConfirmActionDialog
          actionColorTheme="error"
          actionName="Delete Account"
          isOpen={isOpen}
          message="Are you sure you want to delete your account?"
          onClose={() => setIsOpen(false)}
          onConfirm={onConfirmDelete}
        />
      </fetcher.Form>
      <Form method="post">
        <div className="Profile__inputsContainer">
          <div className="Profile__fieldsContainer">
            <TextField
              className="Profile__field"
              defaultValue={user.email}
              error={actionData?.errors?.email}
              helperText={actionData?.errors?.email}
              label="Email"
              name="email"
              type="text"
            />
            <TextField
              className="Profile__field"
              defaultValue={user.first_name}
              label="First Name"
              name="first_name"
              type="text"
            />
            <TextField
              className="Profile__field"
              defaultValue={user.last_name}
              label="Last Name"
              name="last_name"
              type="text"
            />
            <TextField
              className="Profile__field"
              value={new Date(user.updated_date).toLocaleDateString("en-GB")}
              disabled
              label="Last Updated"
              name="updated"
              type="text"
            />
            <TextField
              className="Profile__field"
              value={new Date(user.created_date).toLocaleDateString("en-GB")}
              disabled
              label="Created"
              name="created"
              type="text"
            />
          </div>

          <Button
            name="_action"
            type="submit"
            value="update"
            variant="contained"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Page>
  );
}
