require("dotenv").config();

const { scrapeFacebookPosts } = require("./src/services/facebookPostsService");

module.exports = {
    scrapeFacebookPosts,
};

if (require.main === module) {
    const links = process.argv.slice(2);

    scrapeFacebookPosts({
        links,
        onlyPostsNewerThan: "2026-10-04",
        onlyPostsOlderThan: "2026-10-05",
    })
        .then((posts) => {
            console.log(JSON.stringify(posts, null, 2));
            console.log(`Đã lấy ${posts.length} bài viết.`);
        })
        .catch((error) => {
            console.error("Facebook posts scraping failed:", error.message);
            process.exitCode = 1;
        });
}
