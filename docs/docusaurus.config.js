module.exports = {
  title: "RbxNet",
  tagline: "Advanced multi-language networking library for Roblox.",
  url: "https://docs.australis.dev/rbx-net",
  baseUrl: "/rbx-net/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "roblox-aurora", // Usually your GitHub org/user name.
  projectName: "rbx-net", // Usually your repo name.
  themeConfig: {
    colorMode: {
      // defaultMode: "dark",
      // disableSwitch: true,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require("prism-react-renderer/themes/vsDark"),
      additionalLanguages: ["typescript", "lua", "powershell", "toml"],
    },
    navbar: {
      title: "RbxNet",
      logo: {
        alt: "RbxNet Logo",
        src: "img/net2.svg",
        srcDark: "img/net2-light.svg",
      },
      items: [
        {
          label: "Documentation",
          type: "docsVersion",
        },
        {
          type: "docsVersionDropdown",
          position: "right",

          // Add additional dropdown items at the beginning/end of the dropdown.
          dropdownItemsBefore: [],
          dropdownItemsAfter: [],

          // Do not add the link active class when browsing docs.
          dropdownActiveClassDisabled: true,
        },
        // { to: "docs/api", label: "API", position: "right" },
        { to: "blog", label: "Updates", position: "right" },
        {
          href: "https://github.com/roblox-aurora/rbx-net",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Style Guide',
        //       to: 'docs/',
        //     },
        //     {
        //       label: 'Second Doc',
        //       to: 'docs/doc2/',
        //     },
        //   ],
        // },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: 'blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/roblox-aurora/rbx-net',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jonathan Holmes`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.json"),
          lastVersion: "2.0.x",
          versions: {
            current: {
              label: require("../package.json").version,
              path: "2.1"
            },
            "2.0.x": {
              label: "2.0.0",
              path: "2.0",
            }
          },
          // Please change this to your repo.
          editUrl: "https://github.com/roblox-aurora/rbx-net/edit/main/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/roblox-aurora/rbx-net/edit/main/docs/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
