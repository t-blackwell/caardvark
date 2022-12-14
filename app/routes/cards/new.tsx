import { FormControl, InputLabel, Select } from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import * as React from "react";
import { createCard } from "~/models/card.server";
import { getCardTemplates } from "~/models/card_template.server";
import { getCardTypes } from "~/models/card_type.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/cards/new.css";

export const loader: LoaderFunction = async ({ request, params }) => {
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
  console.log("working");
  const formData = await request.formData();

  const selectedType = formData.get("type");
  const selectedTemplate = formData.get("template");

  if (typeof selectedTemplate === "string") {
    const form = formData.get("__form");
    if (typeof form === "string") {
      if (form === "create") {
        const userId = await requireUserId(request);
        const to = formData.get("to");
        const from = formData.get("from");
        console.log("to ", to);
        console.log("from ", from);

        if (typeof to !== "string" || to.length === 0) {
          console.log("here");
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
          card_template_id: +selectedTemplate,
          from: from,
          to: to,
          user_id: userId,
        });

        return redirect(`/${card.hash}`);
      }
    }
    if (typeof selectedTemplate === "string") {
      const searchParams = new URLSearchParams({ template: selectedTemplate });
      return redirect(`/cards/new?${searchParams}`);
    }
  }

  if (typeof selectedType === "string") {
    const searchParams = new URLSearchParams({ type: selectedType });
    return redirect(`/cards/new?${searchParams}`);
  }

  return redirect(`/cards/new`);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewCardPage() {
  // TODO: add types
  const templateData = useLoaderData<any>();
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
        <input type="hidden" name="__form" value="create" />
        <input type="hidden" name="type" value={templateData.selectedType} />
        <input
          type="hidden"
          name="template"
          value={templateData.selectedTemplate}
        />
        <p>
          <label>
            To:
            <input
              type="text"
              name="to"
              aria-invalid={actionData?.errors?.to ? true : undefined}
              aria-errormessage={
                actionData?.errors?.to ? "to-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.to && (
            <div id="to-error">{actionData.errors.to}</div>
          )}
        </p>
        <p>
          <label>
            From:
            <input
              type="text"
              name="from"
              aria-invalid={actionData?.errors?.from ? true : undefined}
              aria-errormessage={
                actionData?.errors?.from ? "from-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.from && (
            <div id="from-error">{actionData.errors.from}</div>
          )}
        </p>
        <p>
          <button type="submit" name="_action" value="update">
            Create
          </button>
        </p>
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
          {templateData.types.map((type: any) => (
            <option key={type.card_type_id} value={type.card_type_id}>
              {type.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <div className="NewCard__templates">
        {templateData.templates.map((template: any) => (
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