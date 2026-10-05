const { ApifyClient } = require('apify-client');
const fs = require('fs');

// Initialize the ApifyClient with your Apify API token
const client = new ApifyClient({
    token: '',
});

// Prepare Actor input
const input = {
    startUrls: [
        {
            url: 'https://www.facebook.com/grabfanthang9/posts/pfbid07pyBoHkRxpFgEAiLErFy4mnrVRo9haRPwbLVpF6mwKbKBi9Qrsgp4BWFr3kmpi35l',
        }
    ],
    resultsLimit: 10,
    includeNestedComments: true,
    viewOption: 'RANKED_THREADED',
};

async function main() {
    // Run the Actor and wait for it to finish
    const run = await client
        .actor('dami_studio/facebook-comments-scraper')
        .call(input);

    // Fetch Actor results from the run's dataset
    console.log('Results from dataset');

    console.log(
        `💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`
    );

    const { items } = await client
        .dataset(run.defaultDatasetId)
        .listItems();

    console.log(`Đã lấy được ${items.length} comments`);

    // Ghi kết quả vào file comment.json
    fs.writeFileSync(
        'comment.json',
        JSON.stringify(items, null, 2),
        'utf-8'
    );

    console.log('Đã lưu kết quả vào comment.json');
}

main();