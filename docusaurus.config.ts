import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "JianHui",
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "note",
        path: "note",
        routeBasePath: "note",
        sidebarPath: "./sidebarsNote.ts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "project",
        path: "project",
        routeBasePath: "project",
        sidebarPath: "./sidebarsProject.ts",
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/logo.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "JianHui",
      logo: {
        alt: "JianHui Logo",
        src: "img/logo.png",
      },
      items: [
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "noteSidebar",
          docsPluginId: "note",
          position: "left",
          label: "Note",
        },
        {
          type: "docSidebar",
          sidebarId: "projectSidebar",
          docsPluginId: "project",
          position: "left",
          label: "Project",
        },
        {
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Navigation",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "Note",
              to: "/note",
            },
            {
              label: "Project",
              to: "/project",
            },
          ],
        },
        {
          title: "Find me on",
          items: [
            {
              label: "Github",
              href: "https://github.com/Wangjianhui2003",
            },
            {
              label: "X",
              href: "https://x.com/jianhui03",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
