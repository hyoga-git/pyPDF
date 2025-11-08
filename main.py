from flask import Flask, render_template, request, send_file
from pypdf import PdfReader, PdfWriter
import tempfile, os
from io import BytesIO

# Flask アプリ初期化
app = Flask(__name__)

# ルートエンドポイント: UIページを返す
@app.route('/')
def index():
    return render_template('index.html')


# /merge エンドポイント: PDF結合処理
@app.route('/merge', methods=['POST'])
def merge():
    # アップロードされたPDFファイル群を取得
    files = request.files.getlist('pdfs')
    if not files:
        return "PDFを選択してください", 400

    # ファイル名取得（未指定時は merged.pdf にする）
    name = request.form.get('filename', 'merged')
    if not name.lower().endswith('.pdf'):
        name += '.pdf'

    # 出力用PDF（結合先）インスタンス生成
    writer = PdfWriter()

    # 各PDFを順次読み込み、ページを writer に追加
    for f in files:
        reader = PdfReader(BytesIO(f.read()))  # メモリ上でPDFを読み込む
        if reader.is_encrypted:
            reader.decrypt('')  # パスワードなし暗号PDF対応
        for p in reader.pages:
            writer.add_page(p)

    # 一時ファイルに書き出し（送信用）
    temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    writer.write(temp)
    temp.close()

    # レスポンスとしてファイルを返却（自動ダウンロード）
    path = temp.name
    response = send_file(path, as_attachment=True, download_name=name)

    # 送信後に一時ファイル削除
    os.remove(path)
    return response


# アプリ起動（開発モード）
if __name__ == '__main__':
    app.run(debug=True)
