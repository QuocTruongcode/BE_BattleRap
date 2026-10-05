const { ApifyClient } = require("apify-client");
const FACEBOOK_HOST = /(^|\.)facebook\.com$/i;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) => {
    if (typeof value !== "string" || !DATE_FORMAT.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const validateInput = ({ links, onlyPostsNewerThan, onlyPostsOlderThan }) => {
    if (!Array.isArray(links) || links.length === 0) {
        const error = new Error("'links' phải là mảng chứa ít nhất một đường dẫn Facebook");
        error.statusCode = 400;
        throw error;
    }

    for (const link of links) {
        if (typeof link !== "string") {
            const error = new Error("Mỗi phần tử trong 'links' phải là một URL Facebook hợp lệ");
            error.statusCode = 400;
            throw error;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(link);
        } catch {
            const error = new Error(`URL không hợp lệ: ${link}`);
            error.statusCode = 400;
            throw error;
        }

        if (
            parsedUrl.protocol !== "https:" ||
            !FACEBOOK_HOST.test(parsedUrl.hostname)
        ) {
            const error = new Error(`URL phải thuộc Facebook và sử dụng HTTPS: ${link}`);
            error.statusCode = 400;
            throw error;
        }
    }

    if (!isValidDate(onlyPostsNewerThan) || !isValidDate(onlyPostsOlderThan)) {
        const error = new Error("Ngày phải đúng định dạng YYYY-MM-DD và là ngày hợp lệ");
        error.statusCode = 400;
        throw error;
    }

    if (onlyPostsNewerThan > onlyPostsOlderThan) {
        const error = new Error("'onlyPostsNewerThan' phải nhỏ hơn hoặc bằng 'onlyPostsOlderThan'");
        error.statusCode = 400;
        throw error;
    }
};

const scrapeFacebookPosts = async ({
    links,
    onlyPostsNewerThan,
    onlyPostsOlderThan,
}) => {
    validateInput({ links, onlyPostsNewerThan, onlyPostsOlderThan });

    const token = process.env.APIFY_API_KEY;
    if (!token) {
        throw new Error("Missing APIFY_API_TOKEN in environment variables");
    }

    const client = new ApifyClient({ token });
    const run = await client.actor("apify/facebook-posts-scraper").call({
        startUrls: links.map((url) => ({ url })),
        resultsLimit: 20,
        onlyPostsNewerThan,
        onlyPostsOlderThan,
    });

    if (run.status !== "SUCCEEDED") {
        throw new Error(`Facebook posts scraper finished with status: ${run.status}`);
    }

    if (!run.defaultDatasetId) {
        throw new Error("Facebook posts scraper did not return a dataset");
    }

    const dataset = client.dataset(run.defaultDatasetId);
    const posts = [];
    const pageSize = 1000;
    let offset = 0;

    while (true) {
        const { items } = await dataset.listItems({ offset, limit: pageSize });
        posts.push(...items);

        if (items.length < pageSize) {
            break;
        }

        offset += items.length;
    }

    return posts.map((post) => ({
        facebookUrl: post.facebookUrl,
        postId: post.postId,
        pageName: post.pageName,
        url: post.url,
        time: post.time,
        text: post.text,

    }));
};

module.exports = {
    scrapeFacebookPosts,
};
