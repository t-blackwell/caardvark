import { FormControl, InputLabel, Select } from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import * as React from "react";
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

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  console.log("serach paramas", searchParams);
  const dummyData = getDummyData();

  const filteredTemplates = dummyData.templates.filter(
    (template) =>
      searchParams.type === undefined ||
      template.type_id === Number(searchParams.type)
  );
  return json({
    types: dummyData.types,
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
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <div className="NewCard__templates">
        {templateData.templates.map((template: any) => (
          <div className="NewCard__template" key={template.id}>
            {template.text}
          </div>
        ))}
      </div>
    </Form>
  );
}
