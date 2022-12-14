import {
  Button,
  FormControl,
  InputLabel,
  Link,
  Select,
  TextField,
  MenuItem,
} from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useLoaderData,
  useNavigate,
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
  const action = formData.get("_action");

  if (action === "create") {
    const selectedTemplate = formData.get("template");
    const selectedTemplateNumorNull =
      selectedTemplate !== null ? Number(selectedTemplate) : null;
    invariant(selectedTemplateNumorNull, "Error");
    const userId = await requireUserId(request);
    const to = formData.get("to");
    const from = formData.get("from");

    const toError = typeof to !== "string" || to.length === 0;
    const fromError = typeof to !== "string" || to.length === 0;
    if (toError || fromError) {
      return json(
        {
          errors: {
            to: toError ? "to is required" : null,
            from: fromError ? "from is required" : null,
          },
        },
        { status: 400 }
      );
    }

    invariant(typeof to === "string", "Error");
    invariant(typeof from === "string", "Error");

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
  const navigate = useNavigate();
  console.log(templateData.selectedType);

  if (templateData.selectedTemplate !== undefined) {
    return (
      <Form method="post" className="CreateForm">
        <input
          type="hidden"
          name="template"
          value={templateData.selectedTemplate}
        />
        <TextField
          label="To"
          type="text"
          name="to"
          autoFocus
          error={actionData?.errors?.to !== undefined}
          helperText={actionData?.errors?.to}
        />
        <TextField
          label="From"
          type="text"
          name="from"
          error={actionData?.errors?.from !== undefined}
          helperText={actionData?.errors?.from}
        />
        <div>
          <Button className="CreateForm__backButton">
            <Link
              component={RemixLink}
              to={`/cards/new${
                templateData.selectedType !== undefined
                  ? `?type=${templateData.selectedType}`
                  : ""
              }`}
              className="CreateForm__backButtonLink"
              underline="none"
            >
              Back
            </Link>
          </Button>
          <Button
            type="submit"
            name="_action"
            value="create"
            className="CreateForm__createButton"
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
