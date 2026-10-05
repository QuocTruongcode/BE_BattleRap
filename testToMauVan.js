// Máy chủ thử nghiệm: không cần cài thêm gói nào (chỉ dùng module có sẵn của Node).
// Cách chạy:  node test-server.js     rồi mở trình duyệt:  http://localhost:3000
// Đặt file này ở thư mục gốc của dự án, cạnh thư mục src/ và data/.

const http = require('http');
const { checkTheRhyme } = require('./src/services/checkTheRhymeService.js'); // ĐỔI đường dẫn này cho đúng file chứa checkTheRhyme của bạn

const PORT = 3000;

const TRANG = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>Thử tô vần</title>
<style>
  body{font-family:sans-serif;max-width:900px;margin:24px auto;padding:0 12px}
  textarea{width:100%;height:220px;font-size:16px;box-sizing:border-box}
  label{margin-right:16px}
  input[type=number]{width:70px}
  button{font-size:16px;padding:6px 18px;margin-top:10px}
  #ketqua{margin-top:18px;padding:12px;border:1px solid #ccc;border-radius:6px;min-height:40px}
  #phu{margin-top:10px;color:#555;font-size:14px}
</style></head><body>
<h2>Thử tô màu vần</h2>
<textarea id="text">Em đi trên con đường vắng
Anh nhớ ánh trăng vàng
Gió mang theo bao nỗi thương
Lòng vương vấn mãi không tan</textarea><br>
<label>Số từ cuối câu <input type="number" id="finalWordCount" value="5" min="0"></label>
<label>Ngưỡng cuối câu <input type="number" id="finalThreshold" value="0.75" step="0.05"></label>
<label>Ngưỡng vần đôi <input type="number" id="strictThreshold" value="0.85" step="0.05"></label><br>
<button id="chay">Tô màu</button>
<div id="ketqua"></div>
<div id="phu"></div>
<script>
async function chay() {
  const body = {
    text: document.getElementById('text').value,
    options: {
      finalWordCount: Number(document.getElementById('finalWordCount').value),
      finalThreshold: Number(document.getElementById('finalThreshold').value),
      strictThreshold: Number(document.getElementById('strictThreshold').value),
    },
  };
  const res = await fetch('/api/rhyme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (data.error) { document.getElementById('ketqua').textContent = 'Lỗi: ' + data.error; return; }
  document.getElementById('ketqua').innerHTML = data.html;
  document.getElementById('phu').textContent =
    'Số nhóm vần: ' + data.groupCount +
    (data.unrecognizedWords.length ? ' | Không nhận ra: ' + data.unrecognizedWords.join(', ') : '');
}
document.getElementById('chay').addEventListener('click', chay);
chay();
</script></body></html>`;

function guiJson(res, code, obj) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
    const duong = req.url.split('?')[0];

    if (req.method === 'GET' && duong === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(TRANG);
    }

    if (req.method === 'POST' && duong === '/api/rhyme') {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 1e6) req.destroy();            // giới hạn 1 MB
        });
        req.on('end', () => {
            try {
                const { text, options } = JSON.parse(raw || '{}');
                guiJson(res, 200, checkTheRhyme(text, options));
            } catch (loi) {
                guiJson(res, 400, { error: loi.message });
            }
        });
        return;
    }

    guiJson(res, 404, { error: 'Không tìm thấy' });
}).listen(PORT, () => console.log('Mở trình duyệt: http://localhost:' + PORT));