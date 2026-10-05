const vanTiengViet = require('../data/van_tieng_viet.json');

const DIEM_NGUYEN_AM = new Map([
    [['a', 'ă'].sort().join('|'), 0.9],
    [['ɤ', 'ɤ̆'].sort().join('|'), 0.9],
    [['o', 'ɔ'].sort().join('|'), 0.8],
    [['e', 'ɛ'].sort().join('|'), 0.8],
    [['a', 'ɛ'].sort().join('|'), 0.6],
]);

const MUI = new Set(['m', 'n', 'ŋ', 'ɲ']);
const TAC = new Set(['p', 't', 'k', 'tʃ']);
const MUI_GAN = new Set(['n', 'ŋ', 'ɲ']);
const TAC_GAN = new Set(['t', 'k', 'tʃ']);
const BAN_NGUYEN_AM = new Set(['j', 'w']);
const DOI_CUNG_VI_TRI = [
    new Set(['m', 'p']),
    new Set(['n', 't']),
    new Set(['ŋ', 'k']),
    new Set(['ɲ', 'tʃ']),
];

const TU_NGOAI_LE = new Map(Object.entries({ solo: 'lô', track: 'trắc', beat: 'bít' }));

function diemNguyenAm(a, b) {
    if (a === b) return 1;
    return DIEM_NGUYEN_AM.get([a, b].sort().join('|')) || 0;
}

function diemAmCuoi(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    if (DOI_CUNG_VI_TRI.some((nhom) => nhom.has(a) && nhom.has(b))) return 0.7;
    if (MUI_GAN.has(a) && MUI_GAN.has(b)) return 0.8;
    if (TAC_GAN.has(a) && TAC_GAN.has(b)) return 0.8;
    if (MUI.has(a) && MUI.has(b)) return 0.6;
    if (TAC.has(a) && TAC.has(b)) return 0.6;
    if (BAN_NGUYEN_AM.has(a) && BAN_NGUYEN_AM.has(b)) return 0.3;
    return 0;
}

function diemVan(a, b) {
    return 0.6 * diemNguyenAm(a[0], b[0]) + 0.4 * diemAmCuoi(a[1], b[1]);
}

function mauNhom(index) {
    const hue = Math.round((index * 137.508) % 360);
    const lightness = 80 + (index % 3) * 4;
    return `hsl(${hue}, 75%, ${lightness}%)`;
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[char]);
}

function checkTheRhyme(text, options = {}) {
    const finalWordCount = Math.max(0, Math.floor(Number(options.finalWordCount ?? 4) || 0));
    const strictThreshold = Number(options.strictThreshold ?? 0.95);
    const finalThreshold = Number(options.finalThreshold ?? 0.8);
    const sameLineFinal = Boolean(options.sameLineFinal ?? false); // true: cho 5 từ cuối so với nhau ngay trong cùng một câu
    const originalText = String(text ?? '').normalize('NFC');
    const normalizedText = originalText.toLocaleLowerCase('vi');
    const wordPattern = /\p{L}+/gu;
    const tokens = [];
    let previousEnd = 0;
    let sentenceIndex = 0;

    for (const match of normalizedText.matchAll(wordPattern)) {
        const start = match.index;
        const gap = normalizedText.slice(previousEnd, start);
        const breaks = gap.match(/[.!?]+(?:\s*[\r\n]+)?|[\r\n]+/gu);
        if (breaks) sentenceIndex += breaks.length;

        const word = match[0];
        const pronunciation = vanTiengViet[TU_NGOAI_LE.get(word) ?? word];
        tokens.push({
            word,
            start,
            end: start + word.length,
            sentence: sentenceIndex,
            pronunciation: Array.isArray(pronunciation) ? pronunciation : null,
            index: tokens.length,
        });
        previousEnd = start + word.length;
    }

    const sentences = new Map();
    for (const token of tokens) {
        if (!sentences.has(token.sentence)) sentences.set(token.sentence, []);
        sentences.get(token.sentence).push(token);
    }

    const finalTokens = new Set();
    if (finalWordCount > 0) {
        for (const sentenceTokens of sentences.values()) {
            for (const token of sentenceTokens.slice(-finalWordCount)) finalTokens.add(token);
        }
    }

    const parent = tokens.map((_, index) => index);
    function find(index) {
        if (parent[index] !== index) parent[index] = find(parent[index]);
        return parent[index];
    }
    function join(a, b) {
        const rootA = find(a.index);
        const rootB = find(b.index);
        if (rootA !== rootB) parent[rootA] = rootB;
    }
    function isDifferentWord(a, b) {
        return a.word !== b.word;
    }

    for (const source of finalTokens) {
        for (const target of tokens) {
            const distance = target.sentence - source.sentence;
            if (distance < 0 || distance > 2 || source === target) continue;
            if (!finalTokens.has(target)) continue;
            if (distance === 0 && !sameLineFinal) continue;
            if (!source.pronunciation || !target.pronunciation || !isDifferentWord(source, target)) continue;
            if (diemVan(source.pronunciation, target.pronunciation) >= finalThreshold) {
                join(source, target);
            }
        }
    }

    const pairs = [];
    for (const sentenceTokens of sentences.values()) {
        for (let index = 0; index < sentenceTokens.length - 1; index += 1) {
            const first = sentenceTokens[index];
            const second = sentenceTokens[index + 1];
            if (first.pronunciation && second.pronunciation) pairs.push([first, second]);
        }
    }

    for (let firstPairIndex = 0; firstPairIndex < pairs.length; firstPairIndex += 1) {
        const [firstA, firstB] = pairs[firstPairIndex];
        for (let secondPairIndex = firstPairIndex + 1; secondPairIndex < pairs.length; secondPairIndex += 1) {
            const [secondA, secondB] = pairs[secondPairIndex];
            if (secondA.index <= firstB.index) continue;
            if (secondA.sentence - firstA.sentence > 1) break;
            if (!isDifferentWord(firstA, secondA) || !isDifferentWord(firstB, secondB)) continue;
            if (diemVan(firstA.pronunciation, secondA.pronunciation) < strictThreshold) continue;
            if (diemVan(firstB.pronunciation, secondB.pronunciation) < strictThreshold) continue;
            join(firstA, secondA);
            join(firstB, secondB);
        }
    }

    const components = new Map();
    for (const token of tokens) {
        if (!token.pronunciation) continue;
        const root = find(token.index);
        if (!components.has(root)) components.set(root, []);
        components.get(root).push(token);
    }

    const colors = new Map();
    const groups = [];
    for (const members of components.values()) {
        if (members.length < 2) continue;
        const color = mauNhom(groups.length);
        for (const token of members) colors.set(token.index, color);
        groups.push({
            id: groups.length,
            color,
            words: members.map((token) => token.word),
            positions: members.map(({ word, start, end, sentence }) => ({ word, start, end, sentence })),
        });
    }

    let html = '';
    let cursor = 0;
    for (const token of tokens) {
        html += escapeHtml(originalText.slice(cursor, token.start));
        const color = colors.get(token.index);
        const word = escapeHtml(originalText.slice(token.start, token.end));
        html += color
            ? `<span style="background:${color};padding:1px 3px;border-radius:4px">${word}</span>`
            : word;
        cursor = token.end;
    }
    html += escapeHtml(originalText.slice(cursor));

    return {
        normalizedText,
        html: `<div style="font-size:18px;line-height:2">${html.replace(/\r?\n/g, '<br>')}</div>`,
        groups,
        groupCount: groups.length,
        unrecognizedWords: [...new Set(tokens.filter((token) => !token.pronunciation).map((token) => token.word))],
    };
}

module.exports = { checkTheRhyme };