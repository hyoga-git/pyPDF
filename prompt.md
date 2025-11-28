# PDF結合Webアプリを生成してください（Flask + PyPDF2 + HTML+JS）

以下の要件・設計に基づいて **app.py / Dockerfile / docker-compose.yml の3ファイル** を生成してください。
出力は以下の形式で、余計な説明を一切入れず、**ファイル名とコードのみ**にしてください：

app.py:
<コード>

Dockerfile:
<コード>

docker-compose.yml:
<コード>

yaml
コードをコピーする

---

# 📌 要件概要
- Flask 1ファイル（app.py）で API と Web UI を完結
- PDF結合に PyPDF2 を使用
- Docker で動作
- HTML + JavaScript で PDF input の追加が可能
- PDFプレビュー機能あり（ローカルURL使用）
- ファイル保存禁止（全処理をメモリ上で実施）
- コードはコピペ即動作する完全版

---

# 📌 生成対象ファイル
1. `app.py`
2. `Dockerfile`
3. `docker-compose.yml`

---

# 📌 Flask 仕様（app.py）

## ルート一覧
### GET `/`
- HTML（TailwindCDN + JS含む）を返す
- HTMLは app.py 内で `return """ ... """` として文字列で埋め込む
- 以下のUIを含む  
  - PDFファイル入力欄（初期1つ）
  - 「＋ PDF追加」ボタン（JSで input 生増殖）
  - 「結合する」ボタン（/merge にPOST）
  - PDFプレビュー領域 #previewArea

### POST `/merge`
- multipart/form-data で `name="pdfs"` の file input を複数受け取る
- バリデーション：
  - ファイル0件 → 400
  - 空ファイル → 400
  - PDF以外のMIME → 400
- 処理：
  - PyPDF2 の PdfReader で読み込み
  - PdfWriter にページ結合
  - BytesIO に書き出し
  - send_file で `merged.pdf` を返却
- エラー時は 400 or 500 を返す

---

# 📌 HTML 要件

## HTML（app.py 内文字列で返す）
- Tailwind CDN を使用
- `<div id="inputs">` に PDF input 群
- `<button id="addBtn">＋PDF追加</button>` で input追加
- `<div id="previewArea">` に PDFプレビューを並べる
- 全体を白カード + 影のレイアウトにする

---

# 📌 JavaScript 要件

### (1) PDF input 追加
```js
document.getElementById("addBtn").addEventListener("click", () => {
    const div = document.getElementById("inputs");
    const input = document.createElement("input");
    input.type = "file";
    input.name = "pdfs";
    input.accept = "application/pdf";
    input.className = "block w-full";
    div.appendChild(input);
});
(2) PDFプレビュー表示
input change イベントで PDF を <embed> 表示

サーバーと通信せず、URL.createObjectURL() を使用

previewArea に append する

プレビューサンプル：

js
コードをコピーする
const preview = document.createElement("embed");
preview.src = URL.createObjectURL(file);
preview.type = "application/pdf";
preview.className = "w-full h-40 mt-3 border";
previewArea.appendChild(preview);
📌 Python PDF結合ロジック（必須仕様）
arduino
コードをコピーする
files = request.files.getlist("pdfs")
writer = PdfWriter()
for f in files:
    reader = PdfReader(f)
    for page in reader.pages:
        writer.add_page(page)

buffer = BytesIO()
writer.write(buffer)
buffer.seek(0)
return send_file(buffer, as_attachment=True, download_name="merged.pdf")
📌 Dockerfile 要件
sql
コードをコピーする
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
RUN pip install flask PyPDF2
EXPOSE 5000
CMD ["python", "app.py"]
📌 docker-compose.yml 要件
yaml
コードをコピーする
version: "3"
services:
  pdfmerge:
    build: .
    ports:
      - "5000:5000"
🎯 出力形式（重要）
makefile
コードをコピーする
app.py:
<完全なコード>

Dockerfile:
<完全なコード>

docker-compose.yml:
<完全なコード>