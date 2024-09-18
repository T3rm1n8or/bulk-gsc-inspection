# URL Inspection Tool Documentation

## Overview

The URL Inspection Tool is a web-based application that allows users to inspect multiple URLs using the Google Search Console API. It provides information about the indexing status, coverage, and other important metrics for each URL.

## Features

- Inspect multiple URLs at once
- Display inspection results in a table format
- Export results to CSV
- OAuth 2.0 authentication with Google

## Setup Instructions

### 1. Google Cloud Console Setup

- Go to the Google Cloud Console.
- Create a new project or select an existing one.
- Enable the Search Console API for your project:
  - Go to "APIs & Services" > "Library"
  - Search for "Search Console API"
  - Click on it and press "Enable"
- Set up OAuth 2.0 credentials:
  - Go to "APIs & Services" > "Credentials"
  - Click "Create Credentials" > "OAuth client ID"
  - Choose "Web application" as the application type
  - Set the authorized JavaScript origins to your domain (e.g., https://yourdomain.com)
  - Set the authorized redirect URIs to your tool's URL (e.g., https://yourdomain.com/url-inspection-tool/)
  - Note down the Client ID
- Create an API Key:
  - In the Credentials page, click "Create Credentials" > "API Key"
  - Note down the API Key

### 2. Google Search Console Setup

- Ensure you have a Google Search Console account with verified properties.
- The Google account you use for authentication should have access to the properties you want to inspect.

### 3. Tool Setup

- Clone the repository or download the source code.
- Replace `YOUR_CLIENT_ID_HERE` and `YOUR_API_KEY_HERE` in `script.js` with your actual Client ID and API Key.
- Upload the files to your web server.

## Usage Instructions

1. Open the URL Inspection Tool in your web browser.
2. Enter your Google Cloud Client ID and API Key in the respective input fields.
3. Click the "Initialize" button to set up the API client.
4. Click the "Authorize" button to sign in with your Google account.
5. Enter the site URL you want to inspect. This should match a property you have verified in Google Search Console.
6. Paste the URLs you want to inspect, one per line, in the text area.
7. Click the "Inspect URLs" button to start the inspection process.
8. Once the inspection is complete, you can view the results on the page or export them as a CSV file.

## API Reference

The tool uses the following Google Search Console API endpoint:

- `urlInspection.index.inspect`: Inspects a URL and returns information about indexing status and any issues.

For full API documentation, visit the [Google Search Console API Reference](https://developers.google.com/webmaster-tools/search-console-api-original/v3/urlInspection).

## Troubleshooting

- If you encounter authentication errors, ensure that your Client ID and API Key are correct and that you've set up the OAuth consent screen correctly in the Google Cloud Console.
- If you're not seeing data for certain URLs, make sure they belong to a property you have access to in Google Search Console.
- Check the browser console for any error messages if the tool isn't working as expected.

## Security Considerations

- Never share your Client ID or API Key publicly.
- Use HTTPS to host the tool to ensure secure transmission of authentication tokens.
- Regularly review and revoke access for unused or suspicious OAuth 2.0 clients in your Google account.

## Limitations

- The tool is subject to Google Search Console API quotas and limits.
- It can only inspect URLs for properties you have access to in Google Search Console.

## Support

For issues, feature requests, or contributions, please open an issue on the GitHub repository.
