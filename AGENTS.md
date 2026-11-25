<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application rules
- Apply device appearance with CSS prefers-color-scheme and data-theme overrides from the shared ThemeProvider; this keeps manual and automatic appearance consistent across pages.
- Keep TanStack Start and its file router for the hosted app; the platform requires this runtime rather than React Router.
- Keep application data behind typed mock services and endpoint config; this preserves a replaceable WordPress/WooCommerce boundary without a built-in backend.
- Browser storage is permitted only inside the service adapter for demo drafts, credits and browser appearance preferences; production business persistence must replace the mock adapter.
- Keep marketing copy in the bilingual typed site-content object and interface labels in locale JSON; this supports later ACF content editing.
- Keep all visual styles and semantic colour tokens in the global design system; this preserves consistent rebranding and RTL layout.
- Treat mock purchases, uploads, printing and generation as demonstrations and label them; do not imply payment or fulfillment occurred.
- Keep homepage image-menu disclosures in the shared SiteHeader and pass selection callbacks to the homepage; this keeps catalogue filtering and print selection in their existing presentation state.
