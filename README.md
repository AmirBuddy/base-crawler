# Web Scraping Tool with Node.js and Puppeteer

This is a simple web scraping tool built with Node.js and Puppeteer that extracts links from a specified website. It uses a rate limiter to control the number of concurrent requests and handles retries in case of errors. Additionally, it can send an email notification in case of an error during the scraping process.

## Prerequisites

Before using this tool, make sure you have the following dependencies installed:

- Node.js
- npm (Node Package Manager)

You will also need a Gmail account for sending email notifications.

## Installation

1. Clone this repository or download the provided code.
2. Navigate to the project directory in your terminal.
3. Install the required Node.js packages by running:

```bash
npm install
```

## Configuration

Before using the tool, you need to configure a few settings in the code:

- Update the `baseUrl` variable with the URL of the website you want to scrape.
- Adjust the `maxConcurrentRequests` and `retries` variables according to your needs.
- Configure the user agents in the `userAgentList` array to mimic different user agents.
- Set up the logger according to your preferences.

## Usage

To start the web scraping process, run the following command in your terminal:

```bash
node code.js
```

The tool will fetch links from the specified website, and the results will be logged in the console.

## Error Handling

If an error occurs during the scraping process, the tool will log the error details and attempt to send an email notification using your Gmail account. Make sure to provide your Gmail credentials in the nodemailer.createTransport function to enable email notifications.

## Disclaimer

Please use this tool responsibly and ensure that your web scraping activities comply with the website's terms of service and legal regulations.
