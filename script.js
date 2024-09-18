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

    function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
    }

    async function initializeGapiClient() {
        await gapi.client.init({
            apiKey: apiKeyInput.value,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
    }

    function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientIdInput.value,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
    }

    function maybeEnableButtons() {
        if (gapiInited && gisInited) {
            authorizeButton.style.display = 'block';
        }
    }

    authorizeButton.onclick = () => {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            authorizeButton.style.display = 'none';
            inspectBtn.style.display = 'block';
            urlList.style.display = 'block';
            siteUrlInput.style.display = 'block';
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
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
            displayResults(data);
        } catch (err) {
            console.error(err);
            results.innerHTML = 'Error: ' + err.message;
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
            return {
                url: url,
                sitemaps: data.sitemaps ? data.sitemaps.join(', ') : '',
                referring_pages: data.internalLinks ? data.internalLinks.join(', ') : '',
                last_crawl: data.lastCrawlTime || '',
                crawled_as: data.crawledAs || '',
                crawl_allowed: data.robotsTxtState && data.robotsTxtState.allowed ? 'Yes' : 'No',
                page_fetch: data.pageFetchState ? data.pageFetchState.status : '',
                indexing_allowed: data.indexingState && data.indexingState.robotsTxtState && data.indexingState.robotsTxtState.allowed ? 'Yes' : 'No'
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
        let html = '<table><tr><th>URL</th><th>Sitemaps</th><th>Referring Pages</th><th>Last Crawl</th><th>Crawled As</th><th>Crawl Allowed</th><th>Page Fetch</th><th>Indexing Allowed</th></tr>';
        data.forEach(item => {
            if (item.error) {
                html += `<tr><td>${item.url}</td><td colspan="7">Error: ${item.error}</td></tr>`;
            } else {
                html += `<tr>
                    <td>${item.url}</td>
                    <td>${item.sitemaps}</td>
                    <td>${item.referring_pages}</td>
                    <td>${item.last_crawl}</td>
                    <td>${item.crawled_as}</td>
                    <td>${item.crawl_allowed}</td>
                    <td>${item.page_fetch}</td>
                    <td>${item.indexing_allowed}</td>
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
            return Array.from(row.cells).map(cell => {
                return '"' + cell.innerText.replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
    }

    // Initialize the API client and OAuth
    document.getElementById('initButton').onclick = () => {
        gapiLoaded();
        gisLoaded();
    };
});