document.addEventListener('DOMContentLoaded', function() {
    const inspectBtn = document.getElementById('inspectBtn');
    const exportBtn = document.getElementById('exportBtn');
    const urlList = document.getElementById('urlList');
    const results = document.getElementById('results');
    const apiKeyInput = document.getElementById('apiKey');
    const siteUrlInput = document.getElementById('siteUrl');

    inspectBtn.addEventListener('click', function() {
        const urls = urlList.value.split('\n').filter(url => url.trim() !== '');
        const siteUrl = siteUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        if (urls.length === 0) {
            alert('Please enter at least one URL');
            return;
        }
        
        if (!siteUrl) {
            alert('Please enter your site URL');
            return;
        }

        if (!apiKey) {
            alert('Please enter your Google Cloud API Key');
            return;
        }

        results.innerHTML = 'Inspecting URLs...';
        inspectBtn.disabled = true;

        gapi.load('client', function() {
            initClient(apiKey, urls, siteUrl);
        });
    });

    function initClient(apiKey, urls, siteUrl) {
        gapi.client.init({
            'apiKey': apiKey,
            'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/searchconsole/v1/rest'],
        }).then(function() {
            inspectUrls(urls, siteUrl);
        }).catch(function(error) {
            console.error('Error initializing GAPI client:', error);
            results.innerHTML = 'An error occurred while initializing the API client.';
            inspectBtn.disabled = false;
        });
    }

    function inspectUrls(urls, siteUrl) {
        Promise.all(urls.map(url => inspectUrl(url, siteUrl)))
            .then(displayResults)
            .catch(error => {
                console.error('Error:', error);
                results.innerHTML = 'An error occurred while processing the URLs.';
                inspectBtn.disabled = false;
            });
    }

    function inspectUrl(url, siteUrl) {
        return gapi.client.searchconsole.urlInspection.index.inspect({
            inspectionUrl: url,
            siteUrl: siteUrl
        }).then(response => {
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
        }).catch(error => {
            return {
                url: url,
                error: error.result.error.message
            };
        });
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
        inspectBtn.disabled = false;
        exportBtn.style.display = 'block';
    }

    exportBtn.addEventListener('click', function() {
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
    });

    function generateCSV() {
        const rows = results.querySelectorAll('tr');
        return Array.from(rows).map(row => {
            return Array.from(row.cells).map(cell => {
                return '"' + cell.innerText.replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
    }
});