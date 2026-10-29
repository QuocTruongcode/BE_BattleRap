
"use strict";

/**
 * hls-pipeline.js
 *
 * Encode HLS 360p / 480p / 720p
 * Segment 6 giây, AES-128, upload Cloudflare R2 bằng rclone.
 *
 * Yêu cầu:
 *   - Node.js 18+
 *   - ffmpeg, ffprobe, rclone có trong PATH
 *   - rclone đã cấu hình remote R2, ví dụ tên "r2"
 *
 * Ví dụ:
 *   node hls-pipeline.js "D:/videos/demo.mp4" --id demo-001 \
 *     --key-url-base http://localhost:3000/api/keys/ \
 *     --bucket videorap
 *
 * Chỉ encode, không upload:
 *   node hls-pipeline.js "D:/videos/demo.mp4" --id demo-001 --no-upload
 */

const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const SEGMENT_SECONDS = 6;

const LADDER = [
    { name: "360p", height: 360, videoKbps: 800, audioKbps: 96 },
    { name: "480p", height: 480, videoKbps: 1400, audioKbps: 128 },
    { name: "720p", height: 720, videoKbps: 2500, audioKbps: 128 },
];

// --------------------------------------------------
// 1. Các hàm tiện ích
// --------------------------------------------------

function parseArgs(argv) {
    console.log("Check argv: ", argv)
    const args = {
        input: null,
        id: null,
        keyUrlBase: "http://localhost:3001/api/keys/",
        bucket: process.env.R2_BUCKET_NAME || "",
        remote: process.env.R2_RCLONE_REMOTE || "r2",
        preset: "medium",
        noUpload: false,
        force: false,
    };

    console.log("Check object args: ", args)


    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "--no-upload") {
            args.noUpload = true;
        } else if (arg === "--force") {
            args.force = true;
        } else if (
            [
                "--id",
                "--key-url-base",
                "--bucket",
                "--remote",
                "--preset",
            ].includes(arg)
        ) {
            const value = argv[++i];

            if (!value || value.startsWith("--")) {
                throw new Error(`Thiếu giá trị cho ${arg}`);
            }

            const key = {
                "--id": "id",
                "--key-url-base": "keyUrlBase",
                "--bucket": "bucket",
                "--remote": "remote",
                "--preset": "preset",
            }[arg];

            args[key] = value;
        } else if (arg.startsWith("--")) {
            throw new Error(`Tham số không được hỗ trợ: ${arg}`);
        } else if (args.input === null) {
            args.input = arg;
        } else {
            throw new Error(`Tham số không xác định: ${arg}`);
        }
    }

    if (!args.input || !args.id) {
        throw new Error(
            'Cách dùng: node hls-pipeline.js "video.mp4" --id demo-001'
        );
    }

    // Chỉ chấp nhận chữ ASCII thường, số và dấu gạch ngang.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.id)) {
        throw new Error(
            "--id chỉ gồm chữ thường, số và dấu gạch ngang; " +
            "không được bắt đầu hoặc kết thúc bằng dấu gạch ngang."
        );
    }

    if (!args.noUpload && !args.bucket) {
        throw new Error(
            "Thiếu tên bucket. Hãy dùng --bucket hoặc R2_BUCKET_NAME."
        );
    }

    return args;
}

/**
 * Gọi chương trình bên ngoài mà không dùng shell.
 * Cách này tránh lỗi dấu cách trong đường dẫn và giảm rủi ro
 * khi truyền dữ liệu vào câu lệnh.
 */
function run(command, args, options = {}) {
    console.log(
        "\n$ " +
        [command, ...args]
            .map((v) => `"${String(v).replaceAll('"', '\\"')}"`)
            .join(" ")
    );

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
            windowsHide: true,
            ...options,
        });

        child.on("error", (error) => {
            reject(
                new Error(
                    `Không chạy được ${command}: ${error.message}. ` +
                    "Hãy kiểm tra chương trình đã được cài và có trong PATH."
                )
            );
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} kết thúc với mã lỗi ${code}`));
            }
        });
    });
}

function toFfmpegPath(filePath) {
    // FFmpeg trên Windows xử lý đường dẫn có dấu / thuận tiện hơn.
    return path.resolve(filePath).replaceAll("\\", "/");
}

async function checkTools(needRclone) {
    const checks = [
        ["ffmpeg", ["-version"]],
        ["ffprobe", ["-version"]],
    ];

    if (needRclone) checks.push(["rclone", ["version"]]);

    for (const [tool, args] of checks) {
        try {
            await runCapture(tool, args);
            console.log(`OK: ${tool}`);
        } catch {
            throw new Error(
                `Không tìm thấy hoặc không chạy được ${tool}. ` +
                "Hãy cài đặt và thêm vào PATH."
            );
        }
    }
}

// --------------------------------------------------
// 2. Đọc thông tin video gốc bằng ffprobe
// --------------------------------------------------

async function probe(input) {
    const { stdout } = await runCapture("ffprobe", [
        "-v", "error",
        "-show_entries",
        "stream=codec_type,width,height:format=duration",
        "-of", "json",
        input,
    ]);

    const data = JSON.parse(stdout);

    const video = data.streams.find(
        (stream) => stream.codec_type === "video"
    );

    if (!video) {
        throw new Error("File không có luồng video.");
    }

    return {
        width: Number(video.width),
        height: Number(video.height),
        hasAudio: data.streams.some(
            (stream) => stream.codec_type === "audio"
        ),
        duration: Number(data.format?.duration || 0),
    };
}

function runCapture(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.setEncoding("utf8");
        child.stderr.setEncoding("utf8");

        child.stdout.on("data", (chunk) => {
            stdout += chunk;
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk;
        });

        child.on("error", reject);

        child.on("close", (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(
                    new Error(
                        `${command} lỗi (${code}): ${stderr || "Không có chi tiết"}`
                    )
                );
            }
        });
    });
}

// --------------------------------------------------
// 3. Chọn các mức chất lượng phù hợp
// --------------------------------------------------

function pickRenditions(sourceHeight) {
    const chosen = LADDER.filter(
        (r) => r.height <= sourceHeight
    );

    if (chosen.length > 0) {
        return chosen;
    }

    // Video thấp hơn 360p: giữ chiều cao gần mức gốc,
    // làm tròn xuống số chẵn để tương thích với yuv420p.
    const height = Math.max(2, Math.floor(sourceHeight / 2) * 2);

    return [
        {
            name: `${height}p`,
            height,
            videoKbps: 600,
            audioKbps: 96,
        },
    ];
}

// --------------------------------------------------
// 4. Encode một mức chất lượng thành HLS
// --------------------------------------------------

async function encodeRendition(
    input,
    rendition,
    hasAudio,
    outDir,
    keyInfo,
    preset
) {
    const rdir = path.join(outDir, rendition.name);

    await fs.mkdir(rdir, { recursive: true });

    const args = [
        "-hide_banner",
        "-loglevel", "error",
        "-stats",
        "-y",

        "-i", input,

        "-map", "0:v:0",
    ];

    if (hasAudio) {
        args.push("-map", "0:a:0");
    }

    args.push(
        "-vf", `scale=-2:${rendition.height}`,
        "-c:v", "libx264",
        "-preset", preset,
        "-profile:v", "main",
        "-pix_fmt", "yuv420p",

        "-b:v", `${rendition.videoKbps}k`,
        "-maxrate", `${Math.floor(rendition.videoKbps * 1.07)}k`,
        "-bufsize", `${Math.floor(rendition.videoKbps * 1.5)}k`,

        // Đồng bộ điểm bắt đầu segment giữa các mức chất lượng.
        "-sc_threshold", "0",
        "-force_key_frames",
        `expr:gte(t,n_forced*${SEGMENT_SECONDS})`
    );

    if (hasAudio) {
        args.push(
            "-c:a", "aac",
            "-b:a", `${rendition.audioKbps}k`,
            "-ac", "2"
        );
    }

    args.push(
        "-f", "hls",
        "-hls_time", String(SEGMENT_SECONDS),
        "-hls_playlist_type", "vod",
        "-hls_segment_type", "mpegts",
        "-hls_flags", "independent_segments",
        "-hls_key_info_file", toFfmpegPath(keyInfo),
        "-hls_segment_filename",
        toFfmpegPath(path.join(rdir, "seg_%05d.ts")),
        toFfmpegPath(path.join(rdir, "index.m3u8"))
    );

    await run("ffmpeg", args);
}

// --------------------------------------------------
// 5. Tạo master playlist
// --------------------------------------------------

async function writeMaster(outDir, renditions, sourceWidth, sourceHeight) {
    const lines = [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "#EXT-X-INDEPENDENT-SEGMENTS",
    ];

    for (const r of renditions) {
        const width = Math.max(
            2,
            Math.round((sourceWidth * r.height) / sourceHeight / 2) * 2
        );

        const bandwidth = Math.floor(
            (r.videoKbps * 1.07 + r.audioKbps) * 1000
        );

        lines.push(
            `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},` +
            `RESOLUTION=${width}x${r.height},NAME="${r.name}"`
        );

        lines.push(`${r.name}/index.m3u8`);
    }

    await fs.writeFile(
        path.join(outDir, "master.m3u8"),
        lines.join("\n") + "\n",
        "ascii"
    );
}

// --------------------------------------------------
// 6. Upload segment trước, playlist sau bằng rclone
// --------------------------------------------------

async function upload(outDir, remote, bucket, storageId) {
    const destination = `${remote}:${bucket}/v/${storageId}`;

    const common = [
        "copy",
        outDir,
        destination,
        "--progress",
        "--s3-no-check-bucket",
        "--header-upload",
        "Cache-Control: public, max-age=31536000, immutable",
    ];
    // Bước 1: upload các file segment video.
    await run("rclone", [
        ...common,
        "--include", "*.ts",
        "--header-upload",
        "Content-Type: video/mp2t",
    ]);

    // Bước 2: upload playlist sau khi segment đã có.
    await run("rclone", [
        ...common,
        "--include", "*.m3u8",
        "--header-upload",
        "Content-Type: application/vnd.apple.mpegurl",
    ]);
}

//---------------------------------------------------
//Nhận tham số từ API. Không dùng terminal
//--------------------------------------------------
function normalizeOptions(options = {}) {
    const args = {
        input: options.input ?? null,
        id: options.id ?? null,
        keyUrlBase: options.keyUrlBase ?? "http://localhost:3001/api/keys/",
        bucket: options.bucket ?? process.env.R2_BUCKET_NAME ?? "",
        remote: options.remote ?? process.env.R2_RCLONE_REMOTE ?? "r2",
        preset: options.preset ?? "medium",
        noUpload: options.noUpload ?? false,
        force: options.force ?? false,
    };

    if (!args.input || !args.id) {
        throw new Error("Thiếu input hoặc id");
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.id)) {
        throw new Error(
            "id chỉ gồm chữ thường, số và dấu gạch ngang; " +
            "không được bắt đầu hoặc kết thúc bằng dấu gạch ngang."
        );
    }

    if (!args.noUpload && !args.bucket) {
        throw new Error(
            "Thiếu tên bucket. Hãy truyền bucket hoặc đặt R2_BUCKET_NAME."
        );
    }

    return args;
}

// --------------------------------------------------
// 7. Quy trình chính
// --------------------------------------------------


async function runPipeline(options) {
    // const args = parseArgs(process.argv.slice(2));
    // console.log("Check res parseArgs: ", args)
    // const input = path.resolve(args.input);
    const BASE_DIR = process.env.HLS_BASE_DIR;


    const args = normalizeOptions(options);
    const input = path.resolve(args.input);

    const outDir = path.resolve(BASE_DIR, "hls_output", args.id);
    const privateDir = path.resolve(BASE_DIR, "hls_private", args.id);
    // console.log("Check res outDir: ", outDir)
    // console.log("Check res privateDir: ", privateDir)

    await fs.access(input);

    const inputStat = await fs.stat(input);
    // console.log("Check inputStat: ", inputStat)

    if (!inputStat.isFile()) {
        throw new Error(`Đường dẫn không phải file: ${input}`);
    }

    await checkTools(!args.noUpload);
    // Không ghi đè dữ liệu cũ nếu chưa chỉ định --force.
    for (const dir of [outDir, privateDir]) {
        try {
            await fs.access(dir);

            if (!args.force) {
                throw new Error(
                    `${dir} đã tồn tại. Dùng --force để ghi đè.`
                );
            }

            await fs.rm(dir, { recursive: true, force: true });
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
    }

    await fs.mkdir(outDir, { recursive: true });
    await fs.mkdir(privateDir, { recursive: true });

    const info = await probe(input);
    const renditions = pickRenditions(info.height);

    console.log(
        `\nVideo gốc: ${info.width}x${info.height}, ` +
        `${info.duration.toFixed(1)} giây, ` +
        `âm thanh: ${info.hasAudio ? "có" : "không"}`
    );

    console.log(
        "Các mức encode: " + renditions.map((r) => r.name).join(", ")
    );

    // Tạo khóa AES-128 gồm đúng 16 byte.
    const key = crypto.randomBytes(16);

    const keyFile = path.join(privateDir, "video.key");
    await fs.writeFile(keyFile, key);

    const keyUrl =
        args.keyUrlBase.replace(/\/+$/, "") + "/" + args.id;

    const keyInfo = path.join(privateDir, "keyinfo.txt");

    // Dòng 1: URL mà trình phát sẽ yêu cầu để lấy khóa.
    // Dòng 2: đường dẫn file khóa dùng để mã hóa khi encode.
    await fs.writeFile(
        keyInfo,
        `${keyUrl}\n${toFfmpegPath(keyFile)}\n`,
        "ascii"
    );

    // Encode tuần tự từng mức chất lượng.
    for (const rendition of renditions) {
        console.log(`\n=== Encode ${rendition.name} ===`);

        await encodeRendition(
            input,
            rendition,
            info.hasAudio,
            outDir,
            keyInfo,
            args.preset
        );
    }

    await writeMaster(
        outDir,
        renditions,
        info.width,
        info.height
    );

    // Đường dẫn lưu video ngẫu nhiên trên R2.
    const storageId = crypto.randomBytes(12).toString("hex");

    const meta = {
        video_id: args.id,
        storage_id: storageId,
        master_playlist: `v/${storageId}/master.m3u8`,

        // Dữ liệu bí mật: chỉ lưu ở nơi backend tin cậy.
        key_hex: key.toString("hex"),
        key_url: keyUrl,

        renditions: renditions.map((r) => r.name),
        segment_seconds: SEGMENT_SECONDS,
        duration_seconds: Math.round(info.duration * 100) / 100,
        uploaded: false,
        created_at: new Date().toISOString(),
    };

    const metaFile = path.join(privateDir, "meta.json");

    await fs.writeFile(
        metaFile,
        JSON.stringify(meta, null, 2),
        "utf8"
    );

    if (args.noUpload) {
        console.log("\nĐã encode xong, bỏ qua upload.");
    } else {
        console.log("\n=== Upload lên Cloudflare R2 ===");

        await upload(
            outDir,
            args.remote,
            args.bucket,
            storageId
        );

        meta.uploaded = true;

        await fs.writeFile(
            metaFile,
            JSON.stringify(meta, null, 2),
            "utf8"
        );

        console.log("\nUpload xong.");
    }

    console.log(`\nMetadata: ${metaFile}`);
    console.log(`Playlist trên R2: ${meta.master_playlist}`);
    console.log(`Thư mục HLS: ${outDir}`);
    console.log(`Thư mục riêng tư: ${privateDir}`);

    console.log(
        "\nCẢNH BÁO: Không upload hls_private lên R2 " +
        "hoặc commit thư mục này lên GitHub."
    );

    return meta;
}

// main().catch((error) => {
//     console.error("\nLỖI:", error.message);
//     process.exitCode = 1;
// });
module.exports = { runPipeline };