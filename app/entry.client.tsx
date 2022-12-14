// import styles from "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { RemixBrowser } from "@remix-run/react";
import { ContentState, convertFromHTML, EditorState } from "draft-js";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Editor } from "react-draft-wysiwyg";
import styles from "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const hydrate = () => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export function TextEditor() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Editor
        editorStyle={{ display: "flex", flexDirection: "row" }}
        toolbarStyle={{ display: "flex", flexDirection: "row" }}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        defaultEditorState={EditorState.createWithContent(
          ContentState.createFromText("")
        )}
        onEditorStateChange={() => {}}
        toolbar={{
          options: [
            "inline",
            "blockType",
            "fontSize",
            "fontFamily",
            "list",
            "textAlign",
            "colorPicker",
            "embedded",
            "remove",
            "history",
          ],
          inline: { inDropdown: true },
          blockType: { inDropdown: true },
          fontSize: { inDropdown: true },
          fontFamily: { inDropdown: true },
          list: { inDropdown: true },
          textAlign: { inDropdown: true },
          colorPicker: { inDropdown: true },
          embedded: { inDropdown: true },
          remove: { inDropdown: true },
          history: { inDropdown: true },
        }}
      />
    </div>
  );
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
