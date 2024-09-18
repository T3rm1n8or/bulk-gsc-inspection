const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const API_KEY = 'YOUR_API_KEY_HERE';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/searchconsole/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/webmasters.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.addEventListener('DOMContentLoaded', function() {
    const authorizeButton = document.getElementById('authorizeButton');
    const inspectBtn = document.getElementById('inspectBtn');
    const exportBtn = document.getElementById('exportBtn');
    const urlList = document.getElementById('urlList');
    const results = document.getElementById('results');
    const siteUrlInput = document.getElementById('siteUrl');
    const clientIdInput = document.getElementById('clientId');
    const apiKeyInput = document.getElementById('apiKey');
    const initButton = document.getElementById('initButton');

    function gapiLoaded() {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: apiKeyInput.value,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            maybeEnableButtons();
            handleAuthRedirect();
        });
    }

    async function initializeGapiClient() {
        await gapi.client.init({
            apiKey: apiKeyInput.value,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
        
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientIdInput.value,
            scope: SCOPES,
            callback: (resp) => {
                if (resp.error !== undefined) {
                    throw (resp);
                }
                onAuthSuccess();
            }
        });
    }

    function gisLoaded() {
        gisInited = true;
        maybeEnableButtons();
    }

    function maybeEnableButtons() {
        if (gapiInited && gisInited) {
            initButton.style.display = 'block';
        }
    }

    initButton.onclick = () => {
        if (!clientIdInput.value) {
            alert('Please enter your Google Cloud Client ID');
            return;
        }
        if (!apiKeyInput.value) {
            alert('Please enter your Google Cloud API Key');
            return;
        }

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientIdInput.value,
            scope: SCOPES,
            callback: (resp) => {
                if (resp.error !== undefined) {
                    throw (resp);
                }
                onAuthSuccess();
            }
        });

        authorizeButton.style.display = 'block';
        initButton.style.display = 'none';
    };

    authorizeButton.onclick = () => {
        // If there's no token, or if the token has expired, start a new flow
        if (!gapi.client.getToken() || gapi.client.getToken().expires_at < Date.now()) {
            // Create and encode the redirect URI
            const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
            
            // Construct the authorization URL
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${encodeURIComponent(clientIdInput.value)}` +
                `&redirect_uri=${redirectUri}` +
                `&response_type=token` +
                `&scope=${encodeURIComponent(SCOPES)}`;
            
            // Redirect to the authorization URL
            window.location.href = authUrl;
        } else {
            // If we have a valid token, proceed with the API calls
            onAuthSuccess();
        }
    };

    async function onAuthSuccess() {
        authorizeButton.style.display = 'none';
        inspectBtn.style.display = 'block';
        urlList.style.display = 'block';
        siteUrlInput.style.display = 'block';
        
        // Clear the hash from the URL
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    inspectBtn.onclick = async () => {
        const urls = urlList.value.split('\n').filter(url => url.trim() !== '');
        const siteUrl = siteUrlInput.value.trim();
        
        if (urls.length === 0) {
            alert('Please enter at least one URL');
            return;
        }
        
        if (!siteUrl) {
            alert('Please enter your site URL');
            return;
        }

        results.innerHTML = 'Inspecting URLs...';
        inspectBtn.disabled = true;

        try {
            const data = await Promise.all(urls.map(url => inspectUrl(url, siteUrl)));
            console.log('Inspection results:', JSON.stringify(data, null, 2)); // Log all results as formatted JSON
            displayResults(data);
        } catch (err) {
            console.error('Error during URL inspection:', err);
            results.innerHTML = 'Error: ' + (err.message || 'An unknown error occurred');
        } finally {
            inspectBtn.disabled = false;
        }
    };

    async function inspectUrl(url, siteUrl) {
        try {
            const response = await gapi.client.searchconsole.urlInspection.index.inspect({
                inspectionUrl: url,
                siteUrl: siteUrl
            });
            const data = response.result;
            console.log('Full API response for URL:', url, JSON.stringify(data, null, 2));

            const inspectionResult = data.inspectionResult || {};
            const indexStatusResult = inspectionResult.indexStatusResult || {};
            console.log('Inspection Result:', JSON.stringify(inspectionResult, null, 2));

            return {
                url: url,
                inspectionResultLink: inspectionResult.inspectionResultLink || 'N/A',
                verdict: indexStatusResult.verdict || 'N/A',
                coverageState: indexStatusResult.coverageState || 'N/A',
                robotsTxtState: indexStatusResult.robotsTxtState || 'N/A',
                indexingState: indexStatusResult.indexingState || 'N/A',
                lastCrawlTime: indexStatusResult.lastCrawlTime || 'Not crawled',
                pageFetchState: indexStatusResult.pageFetchState || 'N/A',
                referringUrls: (indexStatusResult.referringUrls && indexStatusResult.referringUrls.length > 0) ? indexStatusResult.referringUrls.join(', ') : 'No referring pages',
                crawledAs: indexStatusResult.crawledAs || 'N/A'
            };
        } catch (error) {
            console.error('Error inspecting URL:', url, error);
            return {
                url: url,
                error: error.result ? error.result.error.message : error.message
            };
        }
    }

    function displayResults(data) {
        let html = '<table><tr><th>URL</th><th>Inspection Link</th><th>Verdict</th><th>Coverage State</th><th>Robots.txt State</th><th>Indexing State</th><th>Last Crawl</th><th>Page Fetch State</th><th>Referring URLs</th><th>Crawled As</th></tr>';
        data.forEach(item => {
            if (item.error) {
                html += `<tr><td>${item.url}</td><td colspan="9">Error: ${item.error}</td></tr>`;
            } else {
                html += `<tr>
                    <td>${item.url || 'N/A'}</td>
                    <td><a href="${item.inspectionResultLink}" target="_blank">Inspect</a></td>
                    <td>${item.verdict || 'N/A'}</td>
                    <td>${item.coverageState || 'N/A'}</td>
                    <td>${item.robotsTxtState || 'N/A'}</td>
                    <td>${item.indexingState || 'N/A'}</td>
                    <td>${item.lastCrawlTime || 'N/A'}</td>
                    <td>${item.pageFetchState || 'N/A'}</td>
                    <td>${item.referringUrls || 'N/A'}</td>
                    <td>${item.crawledAs || 'N/A'}</td>
                </tr>`;
            }
        });
        html += '</table>';
        results.innerHTML = html;
        exportBtn.style.display = 'block';
    }

    exportBtn.onclick = () => {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'url_inspection_results.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    function generateCSV() {
        const rows = results.querySelectorAll('tr');
        return Array.from(rows).map(row => {
            return Array.from(row.cells).map((cell, index) => {
                // For the Inspection Link column, use the href attribute instead of the cell text
                if (index === 1 && cell.querySelector('a')) {
                    return '"' + cell.querySelector('a').href.replace(/"/g, '""') + '"';
                }
                return '"' + cell.innerText.replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
    }

    function handleAuthRedirect() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            gapi.client.setToken({
                access_token: accessToken,
                expires_in: params.get('expires_in')
            });
            onAuthSuccess();
            
            // Clear the hash from the URL
            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    gapiLoaded();
    gisLoaded();
    // Remove this line: handleAuthRedirect();
});