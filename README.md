# BULK GOOGLE SEARCH CONSOLE URL INSPECTION TOOL

A simple client-side tool that lets you inspect bulk URLs in Google Search Console. API key required.

Follow these steps to use the URL Inspection Tool:

- Enter your Google Cloud API Key. You can obtain this from the Google Cloud Console.
- Enter the site URL you want to inspect. This should match a property you have verified in Google Search Console.
- Paste the URLs you want to inspect, one per line, in the text area.
- Click the "Inspect URLs" button to start the inspection process.
- Once the inspection is complete, you can view the results on the page or export them as a CSV file.

**Note:** Keep your API key confidential. Do not share this page with your API key filled in.

# Google Cloud Console Setup for URL Inspection Tool

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project drop-down and select "New Project".
3. Enter a project name and click "Create".
4. Wait for the project to be created and select it as your current project.

## 2. Enable the Search Console API

1. In the left sidebar, navigate to "APIs & Services" > "Library".
2. Search for "Search Console API".
3. Click on the "Search Console API" result.
4. Click "Enable" to activate the API for your project.

## 3. Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to "APIs & Services" > "Credentials".
2. Click "Create Credentials" and select "OAuth client ID".
3. If prompted, configure the OAuth consent screen:
   - Choose "External" as the user type.
   - Fill in the required fields (App name, User support email, Developer contact information).
   - Add "/auth/webmasters.readonly" to the "Scopes for Google APIs" section.
   - Save and continue.
4. Back in the "Create OAuth client ID" screen:
   - Choose "Web application" as the application type.
   - Give your OAuth 2.0 client a name.
   - Under "Authorized JavaScript origins", add the URL where your tool will be hosted (e.g., `https://yourdomain.com`).
   - Click "Create".
5. You'll see a modal with your client ID and client secret. Copy the client ID for later use.

## 4. Create API Key

1. Still in the "Credentials" page, click "Create Credentials" again and select "API key".
2. Copy the generated API key for later use.
3. Click "Edit API key" to restrict it:
   - Under "API restrictions", choose "Restrict key".
   - Select "Search Console API" from the dropdown.
   - Click "Save".

## 5. Configure Your Tool

1. Open your URL Inspection Tool in a text editor.
2. Locate the fields for entering the Client ID and API Key.
3. When using the tool, paste your Client ID and API Key into these fields.

## 6. Important Notes

- Keep your Client ID and API Key confidential. Do not share them publicly.
- If you're developing locally, you can add `http://localhost:8000` (or your local server's address) to the authorized JavaScript origins for testing.
- The tool uses the `/auth/webmasters.readonly` scope, which provides read-only access to Search Console data.
- Users of your tool will need to have the appropriate permissions in Search Console for the sites they want to inspect.

## 7. Troubleshooting

- If you encounter errors, double-check that:
  - The Search Console API is enabled for your project.
  - Your OAuth 2.0 client has the correct JavaScript origins set.
  - You're using the correct Client ID and API Key.
  - The user has the necessary permissions in Search Console for the site they're trying to inspect.
