export default {
  repository: "https://github.com/charliewilco/observatory", // project repo
  docsRepository: "https://github.com/charliewilco/observatory", // docs repo
  branch: "main", // branch of docs
  path: "/", // path of docs
  titleSuffix: " – Observatory",
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: `The Unlicense ${new Date().getFullYear()} © Charlie Peters.`,
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: (
    <>
      <span role="img" aria-label="telescope emoji">
        🔭 &nbsp;
      </span>
      <h1 className="text-base m-0">Observatory</h1>
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Observatory: An observable library for TypeScript" />
      <meta name="og:title" content="Observatory: An observable library for TypeScript" />
    </>
  ),
};
