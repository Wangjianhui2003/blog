import fs from "node:fs";
import path from "node:path";

import type { LoadContext, Plugin } from "@docusaurus/types";

type SectionName = "blog" | "note" | "project";

type SectionConfig = {
  readonly name: SectionName;
  readonly title: string;
  readonly href: string;
  readonly directory: string;
  readonly preferContentPages?: boolean;
};

type FrontMatter = {
  readonly title?: string;
  readonly description?: string;
  readonly slug?: string;
  readonly date?: string;
  readonly draft?: string;
  readonly unlisted?: string;
};

type HomeItem = {
  readonly title: string;
  readonly description?: string;
  readonly permalink: string;
  readonly date?: string;
};

type SortableHomeItem = HomeItem & {
  readonly sortValue: number;
  readonly isIndex: boolean;
};

type HomeContentData = {
  readonly sections: readonly {
    readonly title: string;
    readonly href: string;
    readonly items: readonly HomeItem[];
  }[];
};

const SECTIONS: readonly SectionConfig[] = [
  {
    name: "blog",
    title: "Blog",
    href: "/blog",
    directory: "blog",
  },
  {
    name: "note",
    title: "Note",
    href: "/note",
    directory: "note",
    preferContentPages: true,
  },
  {
    name: "project",
    title: "Project",
    href: "/project",
    directory: "project",
    preferContentPages: true,
  },
];

const FRONT_MATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const MARKDOWN_EXTENSION_REGEX = /\.mdx?$/i;
const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) {
    return {};
  }

  const frontMatter: Record<string, string> = {};

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1));
    frontMatter[key] = value;
  }

  return frontMatter;
}

function extractDateCandidate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(DATE_REGEX);
  return match?.[0];
}

function cleanupMarkdownLine(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

function extractDescription(content: string, frontMatter: FrontMatter): string | undefined {
  if (frontMatter.description) {
    return frontMatter.description;
  }

  const body = content.replace(FRONT_MATTER_REGEX, "");
  const lines = body.split(/\r?\n/);

  for (const line of lines) {
    const cleanedLine = cleanupMarkdownLine(line);
    if (
      !cleanedLine ||
      cleanedLine.startsWith(":::") ||
      cleanedLine.startsWith("{/*") ||
      cleanedLine.startsWith("```")
    ) {
      continue;
    }

    return cleanedLine.length > 88
      ? `${cleanedLine.slice(0, 85).trimEnd()}...`
      : cleanedLine;
  }

  return undefined;
}

function normalizeDocsPermalink(
  section: SectionName,
  relativePath: string,
  frontMatter: FrontMatter,
): string {
  if (frontMatter.slug) {
    const slug = frontMatter.slug.replace(/^\/+|\/+$/g, "");
    return slug ? `/${section}/${slug}` : `/${section}/`;
  }

  const normalizedPath = relativePath.replace(MARKDOWN_EXTENSION_REGEX, "");
  if (normalizedPath === "index") {
    return `/${section}/`;
  }

  if (normalizedPath.endsWith("/index")) {
    return `/${section}/${normalizedPath.slice(0, -"/index".length)}/`;
  }

  return `/${section}/${normalizedPath}`;
}

function normalizeBlogPermalink(
  relativePath: string,
  frontMatter: FrontMatter,
): string {
  if (frontMatter.slug) {
    if (frontMatter.slug.startsWith("/blog/")) {
      return frontMatter.slug;
    }

    const slug = frontMatter.slug.replace(/^\/+|\/+$/g, "");
    return slug ? `/blog/${slug}` : "/blog";
  }

  const fileName = path.posix
    .basename(relativePath)
    .replace(MARKDOWN_EXTENSION_REGEX, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "");

  return `/blog/${fileName}`;
}

function collectMarkdownFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdownFiles(fullPath);
    }

    if (!MARKDOWN_EXTENSION_REGEX.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
}

function toSortableHomeItem(
  siteDir: string,
  config: SectionConfig,
  filePath: string,
): SortableHomeItem | null {
  const content = fs.readFileSync(filePath, "utf8");
  const frontMatter = parseFrontMatter(content);

  if (frontMatter.draft === "true" || frontMatter.unlisted === "true") {
    return null;
  }

  const relativePath = path
    .relative(path.join(siteDir, config.directory), filePath)
    .split(path.sep)
    .join(path.posix.sep);

  const stats = fs.statSync(filePath);
  const explicitDate =
    extractDateCandidate(frontMatter.date) ?? extractDateCandidate(relativePath);
  const sortValue = explicitDate
    ? Date.parse(explicitDate)
    : stats.mtimeMs;

  return {
    title:
      frontMatter.title ??
      path.posix.basename(relativePath).replace(MARKDOWN_EXTENSION_REGEX, ""),
    description: extractDescription(content, frontMatter),
    permalink:
      config.name === "blog"
        ? normalizeBlogPermalink(relativePath, frontMatter)
        : normalizeDocsPermalink(config.name, relativePath, frontMatter),
    date: explicitDate,
    sortValue: Number.isNaN(sortValue) ? stats.mtimeMs : sortValue,
    isIndex: /(^|\/)index\.mdx?$/.test(relativePath),
  };
}

function createSection(siteDir: string, config: SectionConfig) {
  const rootDirectory = path.join(siteDir, config.directory);
  const items = collectMarkdownFiles(rootDirectory)
    .map((filePath) => toSortableHomeItem(siteDir, config, filePath))
    .filter((item): item is SortableHomeItem => item !== null)
    .sort((left, right) => {
      if (left.sortValue !== right.sortValue) {
        return right.sortValue - left.sortValue;
      }

      return left.title.localeCompare(right.title);
    });

  const preferredItems = config.preferContentPages
    ? items.filter((item) => !item.isIndex)
    : items;
  const selectedItems = (preferredItems.length > 0 ? preferredItems : items)
    .slice(0, 4)
    .map(({ sortValue: _sortValue, isIndex: _isIndex, ...item }) => item);

  return {
    title: config.title,
    href: config.href,
    items: selectedItems,
  };
}

function createHomeContent(siteDir: string): HomeContentData {
  return {
    sections: SECTIONS.map((section) => createSection(siteDir, section)),
  };
}

export default function homeContentPlugin(context: LoadContext): Plugin {
  return {
    name: "home-content",

    getPathsToWatch() {
      return SECTIONS.map((section) =>
        path.join(context.siteDir, section.directory, "**/*.{md,mdx}"),
      );
    },

    async loadContent() {
      return createHomeContent(context.siteDir);
    },

    contentLoaded({ content, actions }) {
      actions.setGlobalData(content as HomeContentData);
    },
  };
}
