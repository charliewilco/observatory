const createNextraPlugin = require("nextra");
const withNextra = createNextraPlugin("nextra-theme-docs", "./theme.config.js");

module.exports = withNextra();
