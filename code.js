const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const puppeteer = require("puppeteer");
const { RateLimiter } = require("limiter");
const Winston = require("winston");
const nodemailer = require("nodemailer");

const baseUrl = "https://discord.com";
const maxConcurrentRequests = 5;
const retries = 3;
const limiter = new RateLimiter({
  tokensPerInterval: maxConcurrentRequests,
  interval: "second",
});
const userAgentList = ["User-Agent-1", "User-Agent-2", "User-Agent-3"];
let userAgentIndex = 0;

// Configure the logger
const logger = Winston.createLogger({
  level: "info",
  format: Winston.format.simple(),
  transports: [new Winston.transports.Console()],
});

async function fetchLinks(url, retriesRemaining) {
  try {
    await limiter.removeTokens(1);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(userAgentList[userAgentIndex]);

    await page.goto(url, { timeout: 10000 });
    const html = await page.content();
    await browser.close();

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
    if (retriesRemaining > 0) {
      logger.error(
        `Error fetching URL (${retriesRemaining} retries remaining): ${error.message}`
      );
      return fetchLinks(url, retriesRemaining - 1);
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

(async () => {
  try {
    const links = await fetchLinks(baseUrl, retries);
    logger.info(
      "Found links from the same domain (including subdomains):",
      links
    );
  } catch (error) {
    logger.error("Failed to fetch links:", error.message);

    // Send email notification in case of an error
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "your_email@gmail.com",
        pass: "your_password",
      },
    });

    const mailOptions = {
      from: "your_email@gmail.com",
      to: "recipient_email@gmail.com",
      subject: "Web Scraping Error",
      text: `Web scraping failed with the following error: ${error.message}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        logger.error("Error sending email notification:", err);
      } else {
        logger.info("Email notification sent:", info.response);
      }
    });
  }
})();
