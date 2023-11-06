const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const baseUrl = "https://discord.com";
const retryAttempts = 3; // Number of retry attempts

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36";

async function fetchLinks(url, retries) {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10-second timeout
      headers: {
        "User-Agent": userAgent,
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const links = [];

    $("a").each((index, element) => {
      const link = $(element).attr("href");
      if (link) {
        const absoluteUrl = new URL(link, baseUrl);
        if (isSameDomain(baseUrl, absoluteUrl.href)) {
          links.push(absoluteUrl.href);
        }
      }
    });

    return links;
  } catch (error) {
    if (retries > 0) {
      console.error(
        `Error fetching URL (${retries} retries remaining):`,
        error.message
      );
      return fetchLinks(url, retries - 1);
    } else {
      throw error;
    }
  }
}

function isSameDomain(base, target) {
  const baseHostname = new URL(base).hostname;
  const targetHostname = new URL(target).hostname;
  return (
    targetHostname.endsWith(`.${baseHostname}`) ||
    targetHostname === baseHostname
  );
}

fetchLinks(baseUrl, retryAttempts)
  .then((links) => {
    console.log(
      "Found links from the same domain (including subdomains):",
      links
    );
  })
  .catch((error) => {
    console.error("Failed to fetch links:", error.message);
  });
