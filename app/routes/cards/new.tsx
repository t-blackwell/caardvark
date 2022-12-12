import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/cards/new.css";

function getDummyData() {
  return {
    templates: [
      {
        id: 1,
        type_id: 1,
        text: "Happy Birthday",
        text_css: "color: red",
        bg_css: "background-color: black",
      },
      {
        id: 2,
        type_id: 1,
        text: "Happy Birthday",
        text_css: "color: blue",
        bg_css: "background-color: black",
      },
      {
        id: 3,
        type_id: 2,
        text: "fuck off",
        text_css: "color: green",
        bg_css: "background-color: black",
      },
    ],
    types: [
      { id: 1, label: "Birthday" },
      { id: 2, label: "leaving" },
    ],
  };
}

type LoaderData = typeof getDummyData;

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  console.log("serach paramas", searchParams);
  const dummyData = getDummyData();
  const userId = await requireUserId(request);

  const filteredTemplates = dummyData.templates.filter(
    (template) =>
      searchParams.type === undefined ||
      template.type_id === Number(searchParams.type)
  );
  return json({ types: dummyData.types, templates: filteredTemplates });
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { body: "Body is required", title: null } },
      { status: 400 }
    );
  }

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewCardPage() {
  const templateData = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Type"
        >
          {templateData.types.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="NewCard__templates">
        {templateData.templates.map((template) => (
          <div className="NewCard__template" key={template.id}>
            {template.text}
          </div>
        ))}
      </div>
    </Form>
  );
}
