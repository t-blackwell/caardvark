import {
  FormControl,
  InputLabel,
  MenuItem,
  NativeSelect,
  Select,
  TextField,
} from "@mui/material";
import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
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
  console.log("DO action");
  const formData = await request.formData();
  console.log(formData.entries(), " entries");
  console.log(formData.get("whydoinotwork"), "  whydoinotwork");
  if (formData.get("whydoinotwork") === "") {
    console.log("i am an empty string");
  }
  console.log(formData.get("hiddeninput"));

  const type = formData.get("idonotexist");
  console.log(type, " idonotexist");

  return redirect(`/cards/new`);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewCardPage() {
  const templateData = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();

  const selectForm = React.useRef<HTMLFormElement>(null);
  const handleSubmit = () => {
    console.log(selectForm.current);
    selectForm.current?.submit();
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
      ref={selectForm}
      // onChange={handleSubmit}
    >
      <input type="hidden" name="hiddeninput" value={25} />
      <TextField
        id="select"
        label="type"
        defaultValue={""}
        select
        onChange={handleSubmit}
        inputProps={{ name: "whydoinotwork" }}
      >
        {templateData.types.map((type) => (
          <MenuItem key={type.id} value={type.id}>
            {type.label}
          </MenuItem>
        ))}
      </TextField>
      {/* <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Type"
          inputProps={{ name: "type", type: "text" }}
          defaultValue={""}
        >
          {templateData.types.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl> */}
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
