import { FormControl, InputLabel, Select } from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import * as React from "react";
import { getCardTemplates } from "~/models/card_template.server";
import { getCardTypes } from "~/models/card_type.server";
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
  });
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const selectedType = formData.get("selectedType") || undefined;
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
  const templateData = useLoaderData<any>();

  const submit = useSubmit();
  const handleSubmit = (event: any) => {
    submit(event.currentTarget, { replace: true });
  };

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
      <input type="hidden" name="hiddeninput" value={25} />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Type"
          inputProps={{ name: "selectedType", type: "text" }}
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
          <div className="NewCard__template" key={template.card_template_id}>
            {template.text}
          </div>
        ))}
      </div>
    </Form>
  );
}
