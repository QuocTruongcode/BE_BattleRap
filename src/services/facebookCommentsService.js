const { ApifyClient } = require("apify-client");

const FACEBOOK_HOST = /(^|\.)facebook\.com$/i;

const validateLinks = (links) => {
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

        if (parsedUrl.protocol !== "https:" || !FACEBOOK_HOST.test(parsedUrl.hostname)) {
            const error = new Error(`URL phải thuộc Facebook và sử dụng HTTPS: ${link}`);
            error.statusCode = 400;
            throw error;
        }
    }
};

const groupCommentsByPost = (items) => {
    const posts = new Map();

    for (const item of items) {
        if (typeof item.postId !== "string" || item.postId.length === 0) {
            continue;
        }

        if (!posts.has(item.postId)) {
            posts.set(item.postId, []);
        }
        posts.get(item.postId).push(item);
    }

    return [...posts.entries()].map(([postId, postItems]) => {
        const commentsById = new Map();
        const comments = [];

        for (const item of postItems) {
            if (item.replyToCommentId == null) {
                const comment = {
                    id: item.commentId,
                    text: typeof item.text === "string" ? item.text : "",
                    replies: [],
                };
                comments.push(comment);
                if (item.commentId != null) {
                    commentsById.set(item.commentId, comment);
                }
            }
        }

        for (const item of postItems) {
            if (item.replyToCommentId == null) {
                continue;
            }

            let parentComment = commentsById.get(item.replyToCommentId);
            const visited = new Set([item.commentId]);
            let parentId = item.replyToCommentId;

            while (!parentComment && parentId != null && !visited.has(parentId)) {
                visited.add(parentId);
                const parent = postItems.find((candidate) => candidate.commentId === parentId);
                if (!parent) {
                    break;
                }
                parentId = parent.replyToCommentId;
                parentComment = commentsById.get(parentId);
            }

            if (parentComment) {
                parentComment.replies.push(typeof item.text === "string" ? item.text : "");
            }
        }

        return {
            postId,
            comments: comments.map(({ text, replies }) => ({ text, replies })),
        };
    });
};

const scrapeFacebookComments = async (links) => {
    validateLinks(links);

    const token = process.env.APIFY_API_KEY;
    if (!token) {
        throw new Error("Thiếu APIFY_API_KEY trong biến môi trường");
    }

    const client = new ApifyClient({ token });
    const run = await client.actor("dami_studio/facebook-comments-scraper").call({
        startUrls: links.map((url) => ({ url })),
        resultsLimit: 100,
        includeNestedComments: true,
        viewOption: "RANKED_THREADED",
    });

    if (run.status !== "SUCCEEDED") {
        throw new Error(`Facebook comments scraper kết thúc với trạng thái: ${run.status}`);
    }
    if (!run.defaultDatasetId) {
        throw new Error("Facebook comments scraper không trả về dataset");
    }

    const dataset = client.dataset(run.defaultDatasetId);
    const items = [];
    const pageSize = 1000;
    let offset = 0;

    while (true) {
        const { items: pageItems } = await dataset.listItems({ offset, limit: pageSize });
        items.push(...pageItems);

        if (pageItems.length < pageSize) {
            break;
        }
        offset += pageItems.length;
    }

    return groupCommentsByPost(items);
};

module.exports = {
    scrapeFacebookComments,
};
