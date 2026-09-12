// services/searchService.js

const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');

/**
 * Tìm video theo title
 * Full-Text Search trên Videos.title
 */
async function searchByTitle(keyword) {
    return sequelize.query(`
        SELECT
            v.id,
            v.title,
            v.linkVideo,
            v.thumbnailUrl,
            v.battlerID,
            v.eventID,
            v.cleanScore,
            ft.RANK AS score,
            'title' AS match_type
        FROM Videos v
        INNER JOIN FREETEXTTABLE(
            Videos,
            title,
            :keyword
        ) ft
            ON v.id = ft.[KEY]
        ORDER BY ft.RANK DESC
    `, {
        replacements: { keyword },
        type: QueryTypes.SELECT
    });
}


/**
 * Tìm video thông qua nội dung của Bar
 * Full-Text Search trên Bars.content
 */
async function searchByBarContent(keyword) {
    return sequelize.query(`
        SELECT
            v.id,
            v.title,
            v.linkVideo,
            v.thumbnailUrl,
            v.battlerID,
            v.eventID,
            v.cleanScore,
            ft.RANK AS score,
            'bar' AS match_type
        FROM Bars b
        INNER JOIN FREETEXTTABLE(
            Bars,
            content,
            :keyword
        ) ft
            ON b.id = ft.[KEY]
        INNER JOIN Videos v
            ON v.id = b.videoId
        ORDER BY ft.RANK DESC
    `, {
        replacements: { keyword },
        type: QueryTypes.SELECT
    });
}


/**
 * Gộp kết quả tìm kiếm từ:
 * 1. Videos.title
 * 2. Bars.content
 *
 * Nếu một video xuất hiện ở cả hai kết quả
 * thì chỉ giữ lại một video.
 */
function mergeResults(byTitle, byBarContent) {
    const map = new Map();

    // Kết quả tìm được từ title
    byTitle.forEach(video => {
        map.set(video.id, video);
    });

    // Kết quả tìm được từ content của Bar
    byBarContent.forEach(video => {

        if (!map.has(video.id)) {
            map.set(video.id, video);
        } else {
            const existing = map.get(video.id);

            // Nếu video xuất hiện ở cả title và bar,
            // giữ kết quả có score cao hơn
            if (video.score > existing.score) {
                map.set(video.id, video);
            }
        }
    });

    // Sắp xếp score giảm dần
    return Array.from(map.values())
        .sort((a, b) => b.score - a.score);
}

/**
 * Tìm battler theo RapName và FullName
 * Không phân biệt hoa thường, ưu tiên khớp gần nhất
 */
async function searchBattlers(keyword, { limit = 5 } = {}) {
    const normalizedKeyword = String(keyword ?? '').trim();

    if (!normalizedKeyword) {
        return {
            total: 0,
            limit,
            data: []
        };
    }

    const likeKeyword = `%${normalizedKeyword}%`;
    const prefixKeyword = `${normalizedKeyword}%`;

    const results = await sequelize.query(`
        SELECT
            b.id,
            b.RapName,
            b.FullName,
            b.Describe,
            b.image,
            CASE
                WHEN LOWER(b.RapName) = LOWER(:keyword) THEN 100
                WHEN LOWER(b.FullName) = LOWER(:keyword) THEN 100
                WHEN LOWER(b.RapName) LIKE LOWER(:prefixKeyword) THEN 90
                WHEN LOWER(b.FullName) LIKE LOWER(:prefixKeyword) THEN 90
                WHEN LOWER(b.RapName) LIKE LOWER(:likeKeyword) THEN 70
                WHEN LOWER(b.FullName) LIKE LOWER(:likeKeyword) THEN 70
                ELSE 50
            END AS score,
            CASE
                WHEN LOWER(b.RapName) LIKE LOWER(:prefixKeyword) THEN 'RapName'
                WHEN LOWER(b.FullName) LIKE LOWER(:prefixKeyword) THEN 'FullName'
                WHEN LOWER(b.RapName) LIKE LOWER(:likeKeyword) THEN 'RapName'
                WHEN LOWER(b.FullName) LIKE LOWER(:likeKeyword) THEN 'FullName'
                ELSE 'RapName'
            END AS match_field
        FROM Battlers b
        WHERE
            LOWER(b.RapName) LIKE LOWER(:likeKeyword)
            OR LOWER(b.FullName) LIKE LOWER(:likeKeyword)
        ORDER BY
            CASE
                WHEN LOWER(b.RapName) = LOWER(:keyword) THEN 0
                WHEN LOWER(b.FullName) = LOWER(:keyword) THEN 0
                WHEN LOWER(b.RapName) LIKE LOWER(:prefixKeyword) THEN 1
                WHEN LOWER(b.FullName) LIKE LOWER(:prefixKeyword) THEN 1
                WHEN LOWER(b.RapName) LIKE LOWER(:likeKeyword) THEN 2
                WHEN LOWER(b.FullName) LIKE LOWER(:likeKeyword) THEN 2
                ELSE 3
            END,
            b.RapName ASC
    `, {
        replacements: {
            keyword: normalizedKeyword,
            likeKeyword,
            prefixKeyword
        },
        type: QueryTypes.SELECT
    });

    const sorted = [...results].sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        return String(a.RapName || '').localeCompare(String(b.RapName || ''));
    });

    return {
        total: sorted.length,
        limit,
        data: sorted.slice(0, limit)
    };
}


/**
 * Hàm chính tìm kiếm video
 *
 * Tìm kiếm đồng thời:
 * - Videos.title
 * - Bars.content
 *
 * Sau đó:
 * - Gộp kết quả
 * - Loại video trùng
 * - Sắp xếp theo score
 * - Phân trang
 */
async function searchVideos(
    keyword,
    { page = 1, pageSize = 20 } = {}
) {
    // Chạy 2 query song song
    const [byTitle, byBarContent] = await Promise.all([
        searchByTitle(keyword),
        searchByBarContent(keyword)
    ]);

    // Gộp kết quả
    const merged = mergeResults(
        byTitle,
        byBarContent
    );

    // Tính vị trí bắt đầu
    const offset = (page - 1) * pageSize;

    // Lấy dữ liệu của trang hiện tại
    const paginated = merged.slice(
        offset,
        offset + pageSize
    );

    return {
        total: merged.length,
        page,
        pageSize,
        data: paginated
    };
}


module.exports = {
    searchVideos,
    searchBattlers
};