import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
// import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
// import { TanstackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { Providers } from "@/components/providers/provider";
import { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "cinemora",
      },
      {
        name: "description",
        content:
          "A minimal, beautiful space to organize your entertainment journey. Like digital post-it notes for your favorite movies and TV shows.",
      },
      {
        name: "keywords",
        content:
          "movies, tv shows, tracking, kanban, entertainment, organization, minimal",
      },
      {
        name: "author",
        content: "cinemora",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>{children}</Providers>
        {/* <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}
