import {
  Button,
  FormControl,
  InputLabel,
  Link,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { createCard } from "~/models/card.server";
import type { card_template } from "~/models/card_template.server";
import { getCardTemplates } from "~/models/card_template.server";
import type { card_type } from "~/models/card_type.server";
import { getCardTypes } from "~/models/card_type.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/cards/new.css";

interface LoaderData {
  types: card_type[];
  templates: card_template[];
  selectedType: string;
  selectedTemplate: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const cardTypes = await getCardTypes();
  const cardTemplates = await getCardTemplates();
  if (!cardTypes || !cardTemplates) {
    throw new Response("Not Found", { status: 404 });
  }

  const filteredTemplates = cardTemplates.filter(
    (template) =>
      searchParams.type === undefined ||
      template.card_type_id === Number(searchParams.type)
  );
  return json({
    types: cardTypes,
    templates: filteredTemplates,
    selectedType: searchParams.type,
    selectedTemplate: searchParams.template,
  });
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "create") {
    const selectedTemplate = formData.get("template");
    const selectedTemplateNumorNull =
      selectedTemplate !== null ? Number(selectedTemplate) : null;
    invariant(selectedTemplateNumorNull, "Error");
    const userId = await requireUserId(request);
    const to = formData.get("to");
    const from = formData.get("from");

    if (typeof to !== "string" || to.length === 0) {
      return json(
        { errors: { to: "to is required", from: null } },
        { status: 400 }
      );
    }

    if (typeof from !== "string" || from.length === 0) {
      return json(
        { errors: { from: "from is required", to: null } },
        { status: 400 }
      );
    }

    const card = await createCard({
      card_template_id: selectedTemplateNumorNull,
      from: from,
      to: to,
      user_id: userId,
    });

    return redirect(`/${card.hash}`);
  }
  return redirect(`/cards/new`);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewCardPage() {
  const templateData = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();

  const submit = useSubmit();
  const handleSubmit = (event: any) => {
    submit(event.currentTarget, { replace: true });
  };

  if (templateData.selectedTemplate !== undefined) {
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
        <input
          type="hidden"
          name="template"
          value={templateData.selectedTemplate}
        />
        <Typography className="CreatCard__from" variant="h5">
          To:
        </Typography>
        <TextField
          type="text"
          name="to"
          autoFocus
          error={actionData?.errors?.to !== undefined}
          helperText={actionData?.errors?.to}
        />
        <Typography className="CreatCard__to" variant="h5">
          From:
        </Typography>
        <TextField
          type="text"
          name="from"
          error={actionData?.errors?.from !== undefined}
          helperText={actionData?.errors?.from}
        />
        <div>
          <Button>
            <Link
              component={RemixLink}
              to={`/cards/new?type=${templateData.selectedType}`}
              className="CreatForm__backButton"
              underline="none"
            >
              Back
            </Link>
          </Button>
          <Button
            type="submit"
            name="_action"
            value="create"
            className="CreatForm__backButton"
          >
            Create
          </Button>
        </div>
      </Form>
    );
  }

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
      onChange={handleSubmit}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Type"
          inputProps={{ name: "type", type: "text" }}
          value={templateData.selectedType}
          native
        >
          <option value={""}>All Templates</option>
          {templateData.types.map((type) => (
            <option key={type.card_type_id} value={type.card_type_id}>
              {type.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <div className="NewCard__templates">
        {templateData.templates.map((template) => (
          <button
            key={template.card_template_id}
            type="submit"
            name="template"
            value={template.card_template_id}
          >
            <div className="NewCard__template">{template.text}</div>
          </button>
        ))}
      </div>
    </Form>
  );
}
