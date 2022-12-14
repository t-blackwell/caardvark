import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { createMessage } from "~/models/message.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text");
  const from = formData.get("from");
  const card_id = formData.get("card_id");
  const color_id = formData.get("color_id");
  const font_id = formData.get("font_id");

  const errors = {
    text:
      typeof text !== "string" || text.length === 0
        ? "text is required"
        : undefined,
    from:
      typeof from !== "string" || from.length === 0
        ? "from is required"
        : undefined,
    color_id: typeof color_id !== "number" ? "color_id is required" : undefined,
    font_id: typeof font_id !== "number" ? "font_id is required" : undefined,
    card_id: typeof card_id !== "number" ? "card_id is required" : undefined,
  };

  if (Object.values(errors).every((error) => error === undefined)) {
    const message = await createMessage({
      text,
      from,
      color_id,
      font_id,
      card_id,
    });
    return redirect(`/${message.message_id}`);
  } else return errors;
}

export default function NewMessagePage() {
  const actionData = useActionData<typeof action>();
  const fromRef = React.useRef<HTMLInputElement>(null);
  const textRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.text) {
      textRef.current?.focus();
    } else if (actionData?.errors?.from) {
      fromRef.current?.focus();
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
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>from: </span>
          <input
            ref={fromRef}
            name="from"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 from-lg leading-loose"
            aria-invalid={actionData?.errors?.from ? true : undefined}
            aria-errormessage={
              actionData?.errors?.from ? "from-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.from && (
          <div className="pt-1 from-red-700" id="from-error">
            {actionData.errors.from}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>from: </span>
          <textarea
            ref={textRef}
            name="text"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.text ? true : undefined}
            aria-errormessage={
              actionData?.errors?.text ? "from-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.text && (
          <div className="pt-1 text-red-700" id="text-error">
            {actionData.errors.text}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
