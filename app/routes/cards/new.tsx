import ReplyIcon from "@mui/icons-material/Reply";
import SaveIcon from "@mui/icons-material/Save";
import {
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
} from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import ActionButton from "~/components/ActionButton";
import Page from "~/components/Page";
import TemplatePreview from "~/components/TemplatePreview";
import { createCard } from "~/models/card.server";
import type { card_template } from "~/models/card_template.server";
import { getCardTemplates } from "~/models/card_template.server";
import type { card_type } from "~/models/card_type.server";
import { getCardTypes } from "~/models/card_type.server";
import { getSession, getSessionHeaders, requireUserId } from "~/session.server";
import styles from "~/styles/cards/new.css";
import { setSuccessMessage } from "~/toast-message.server";

function buildUrl(searchParams: { template?: string; type?: string }) {
  const baseUrl = "/cards/new";
  const params = new URLSearchParams(searchParams);
  return `${baseUrl}?${params}`;
}

interface LoaderData {
  types: card_type[];
  templates: card_template[];
  selectedType: string;
  selectedTemplate: card_template;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
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

  const selectedTemplate = cardTemplates.find(
    (template) => template.card_template_id.toString() === searchParams.template
  );

  return json({
    types: cardTypes,
    templates: filteredTemplates,
    selectedType: searchParams.type,
    selectedTemplate,
  });
};

export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

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
    const fromError = typeof from !== "string" || from.length === 0;
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

    const card = await createCard({
      card_template_id: selectedTemplateNumorNull,
      from: from,
      to: to,
      user_id: userId,
    });

    setSuccessMessage(session, "Card created.");

    return redirect(`/${card.hash}`, {
      headers: await getSessionHeaders(session),
    });
  }

  throw new Error(`Action ${action} not recognised`);
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
      <Page
        className="CreateForm__page"
        pageHeaderActions={
          <>
            <ActionButton
              icon={<ReplyIcon />}
              title="Back"
              to="/cards/new"
              variant="outlined"
            />
            <ActionButton
              icon={<SaveIcon />}
              title="Create"
              name="_action"
              type="submit"
              value="create"
              variant="contained"
            />
          </>
        }
        pageHeaderTitle="Create Card"
      >
        <Form method="post">
          <input
            type="hidden"
            name="template"
            value={templateData.selectedTemplate.card_template_id}
          />
          <div className="CreateForm__pageContent">
            <div className="CreateForm__inputsContainer">
              <div className="CreateForm__fieldsContainer">
                <TextField
                  autoFocus
                  className="CreateForm__field"
                  helperText={actionData?.errors?.to}
                  label="To"
                  name="to"
                  type="text"
                />
                <TextField
                  className="CreateForm__field"
                  error={actionData?.errors?.from !== undefined}
                  helperText={actionData?.errors?.from}
                  label="From"
                  name="from"
                  type="text"
                />
              </div>
            </div>
            <div className="CreateForm__templateContainer">
              <TemplatePreview
                backgroundCss={
                  templateData.selectedTemplate.bg_css !== null
                    ? (JSON.parse(
                        templateData.selectedTemplate.bg_css
                      ) as React.CSSProperties)
                    : undefined
                }
                textCss={
                  templateData.selectedTemplate.text_css !== null
                    ? (JSON.parse(
                        templateData.selectedTemplate.text_css
                      ) as React.CSSProperties)
                    : undefined
                }
                text={templateData.selectedTemplate.text ?? ""}
                size="medium"
              />
            </div>
          </div>
        </Form>
      </Page>
    );
  }

  return (
    <Page
      pageHeaderActions={
        <ActionButton
          icon={<ReplyIcon />}
          title="Back"
          to="/cards"
          variant="outlined"
        />
      }
      pageHeaderTitle="Create new card"
    >
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
          <InputLabel id="type-select-label" shrink>
            Category
          </InputLabel>
          <Select
            displayEmpty
            defaultValue=""
            id="type-select"
            inputProps={{ name: "type", type: "text" }}
            label="Category"
            labelId="type-select-label"
            notched
            onChange={(event) =>
              navigate(
                buildUrl({
                  type: event.target.value,
                })
              )
            }
            value={templateData.selectedType}
          >
            <MenuItem value="">All Cards</MenuItem>
            {templateData.types.map((type) => (
              <MenuItem key={type.card_type_id} value={type.card_type_id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="NewCard__templates">
          {templateData.templates.map((template) => (
            <TemplatePreview
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
              text={template.text ?? ""}
              backgroundCss={
                template.bg_css !== null
                  ? (JSON.parse(template.bg_css) as React.CSSProperties)
                  : undefined
              }
              textCss={
                template.text_css !== null
                  ? (JSON.parse(template.text_css) as React.CSSProperties)
                  : undefined
              }
            />
          ))}
        </div>
      </Form>
    </Page>
  );
}
