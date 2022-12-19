import DeleteIcon from "@mui/icons-material/Delete";
import { Button, TextField, useMediaQuery } from "@mui/material";
import { Form, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import classnames from "classnames";
import invariant from "tiny-invariant";
import PageHeader from "~/components/PageHeader";
import { deleteUserByEmail, updateUser } from "~/models/user.server";
import { getSession, getSessionHeaders } from "~/session.server";
import styles from "~/styles/profile.css";
import { setSuccessMessage } from "~/toast-message.server";
import { useUser } from "~/utils";

export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

  const formData = await request.formData();
  const email = formData.get("email");
  const { _action } = Object.fromEntries(formData);

  switch (_action) {
    case "delete":
      invariant(typeof email === "string", "user not found");
      await deleteUserByEmail(email);
      setSuccessMessage(session, "Profile deleted.");

      return redirect("/.", {
        headers: await getSessionHeaders(session),
      });
    case "update":
      const first = formData.get("first_name");
      const last = formData.get("last_name");
      const emailError = typeof email !== "string" || email.length === 0;

      if (emailError) {
        return json(
          {
            errors: {
              email: emailError ? "email is reaqired" : null,
            },
          },
          { status: 400 }
        );
      }
      invariant(typeof first === "string" || first === null, "Error");
      invariant(typeof last === "string" || last === null, "Error");

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
  const smScreen = useMediaQuery("(min-width:370px)");

  const actionData = useActionData();

  return (
    <div className="Profile">
      <Form method="post">
        <input type="hidden" name="user_id" value={user.user_id} />
        <PageHeader
          title="Profile"
          actions={
            <Button
              color="error"
              className={classnames(
                "Profile__actionButton",
                smScreen
                  ? "Profile__actionButton--sm"
                  : "Profile__actionButton--xs"
              )}
              name="_action"
              type="submit"
              value="delete"
              variant="contained"
            >
              {smScreen ? "Delete" : <DeleteIcon></DeleteIcon>}
            </Button>
          }
        />

        <div className="Profile__pageContent">
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
              // disabled={isDeleted || isPublished}
              name="_action"
              type="submit"
              value="update"
              variant="contained"
            >
              Save Changes
            </Button>
          </div>
          <div className="Profile__templateContainer">
            <div>Something</div>
          </div>
        </div>
      </Form>
    </div>
  );
}
