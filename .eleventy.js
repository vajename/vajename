const dotenv = require("dotenv");
const fs = require("fs");

const svgSprite = require("eleventy-plugin-svg-sprite");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const markdownIt = require("markdown-it");
const implicitFigures = require("markdown-it-image-figures");

const localConfigFile = ".env.local";
if (fs.existsSync(localConfigFile)) {
  const envConfig = dotenv.parse(fs.readFileSync(localConfigFile));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

/// Data
const alphabet = require("./src/_data/alphabet");
/// Filters
// const searchFilter = require("./src/filters/searchFilter");
// const { blameAll, getUserData } = require("./src/filters/blame");
// const { blameLast, blameAll } = require("./src/filters/blame");
const {
  toFaDigits,
  formatTime,
  getAutherByEmail,
  ifNoValue,
} = require("./src/utils/index");

module.exports = function (eleventyConfig) {
  /******* PLUGINS  *****/
  eleventyConfig.addPlugin(syntaxHighlight, {
    init: function ({ Prism }) {},
  });
  eleventyConfig.addPlugin(svgSprite, {
    path: "./assets/s",
  });

  /******* FILTERS  *****/
  eleventyConfig.addFilter("toFaDigits", toFaDigits);
  eleventyConfig.addFilter("formatTime", formatTime);
  eleventyConfig.addFilter("ifNoValue", ifNoValue);
  eleventyConfig.addFilter("getAutherByEmail", getAutherByEmail);
  // eleventyConfig.addFilter("search", searchFilter);

  if (process.env.NODE_ENV !== "production") {
    // eleventyConfig.addFilter("blame", () => [
    //   {
    //     email: "someone@mail",
    //     time: new Date(),
    //   },
    // ]);
    eleventyConfig.addFilter("getUserData", () => ({
      user: "",
      url: "",
      avatar_url: "",
    }));
  } else {
    // eleventyConfig.addNunjucksAsyncFilter("blame", (path, callback) =>
    //   blameAll(path).then(callback.bind(null, null))
    // );
    eleventyConfig.addNunjucksAsyncFilter("getUserData", (email, callback) =>
      getUserData(email).then(callback.bind(null, null))
    );
  }

  /******* SHORTCODES  *****/
  // if (process.env.NODE_ENV !== 'production') {
  //   eleventyConfig.addNunjucksShortcode('getFileContributors', () => '###');
  //   eleventyConfig.addNunjucksShortcode('getFileContributorsAPI', () => '###');
  // } else {
  //   eleventyConfig.addNunjucksAsyncShortcode(
  //     'getFileContributors',
  //     getFileContributors
  //   );
  //   eleventyConfig.addNunjucksAsyncShortcode(
  //     'getFileContributorsAPI',
  //     async (path) => {
  //       const contribs = await getFileContributorsByAPI(path);
  //       return `
  //     <ul id="contributors">
  //       ${contribs
  //         .map(
  //           (i) => `
  //         <li>
  //           <a href="${i.url}" target="_blank" rel="noreferrer">
  //             <img src="${i.avatar_url}" />
  //           </a>
  //         </li>
  //       `
  //         )
  //         .join('')}
  //     </ul>`;
  //     }
  //   );
  // }

  /******* COLLECTIONS  *****/
  eleventyConfig.addCollection("words", (collection) => {
    return [...collection.getFilteredByGlob("./words/**/*.md")];
  });
  alphabet.forEach((l) =>
    eleventyConfig.addCollection(l, (collection) => {
      return [...collection.getFilteredByGlob(`./words/${l}/*.md`)];
    })
  );

  /******* DATA  *****/
  // v+1:
  // eleventyConfig.addGlobalData("alphabet", alphabet);

  /******* PASSTHROUGH  *****/
  eleventyConfig.addPassthroughCopy({ assets: "assets" });
  eleventyConfig.addPassthroughCopy({ admin: "admin" });

  /******* Markdown Options  *****/
  const options = {
    html: true,
  };
  const markdownLib = markdownIt(options).use(implicitFigures, {
    figcaption: true,
  });
  eleventyConfig.setLibrary("md", markdownLib);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",

      // ⚠️ These values are both relative to your input directory.
      data: "_data",
      includes: "_includes",
      // layouts: "_layouts"
    },
  };
};
