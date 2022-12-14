import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import { createCard } from "~/models/card.server";
import type { card_template } from "~/models/card_template.server";
import { getCardTemplates } from "~/models/card_template.server";
import type { card_type } from "~/models/card_type.server";
import { getCardTypes } from "~/models/card_type.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/cards/new.css";

function buildUrl(searchParams: { template?: string; type?: string }) {
  const baseUrl = "/cards/new";
  const params = new URLSearchParams(searchParams);
  return `${baseUrl}?${params}`;
}

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
      searchParams.type === "" ||
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

  const selectedType = formData.get("type");
  const selectedTemplate = formData.get("template");
  const selectedTemplateNum = Number(selectedTemplate);

  if (selectedTemplate !== null && !isNaN(selectedTemplateNum)) {
    const form = formData.get("__form");
    if (typeof form === "string") {
      if (form === "create") {
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
          card_template_id: selectedTemplateNum,
          from: from,
          to: to,
          user_id: userId,
        });

        return redirect(`/${card.hash}`);
      }
    }
    const searchParams = new URLSearchParams({
      template: selectedTemplate.toString(),
    });
    return redirect(`/cards/new?${searchParams}`);
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
  const templateData = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

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
    >
      <FormControl fullWidth>
        <InputLabel id="type-select-label">Filter Templates</InputLabel>
        <Select
          id="type-select"
          inputProps={{ name: "type", type: "text" }}
          label="Filter Templates"
          labelId="type-select-label"
          onChange={(event) =>
            navigate(
              buildUrl({
                type: event.target.value,
              })
            )
          }
          value={templateData.selectedType}
        >
          {templateData.types.map((type) => (
            <MenuItem key={type.card_type_id} value={type.card_type_id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="NewCard__templates">
        {templateData.templates.map((template) => (
          <button
            key={template.card_template_id}
            onClick={() =>
              navigate(
                buildUrl({
                  template: template.card_template_id.toString(),
                  ...(templateData.selectedType !== undefined
                    ? { type: templateData.selectedType }
                    : undefined),
                })
              )
            }
            type="button"
          >
            <div className="NewCard__template">{template.text}</div>
          </button>
        ))}
      </div>
    </Form>
  );
}
