from flask import Flask, render_template, request, send_file
from pypdf import PdfReader, PdfWriter
import tempfile, os
from io import BytesIO

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge', methods=['POST'])
def merge():
    files = request.files.getlist('pdfs')
    if not files:
        return "PDFを選択してください", 400

    # ← ファイル名の受け取りと拡張子自動付与
    name = request.form.get('filename', 'merged')
    if not name.lower().endswith('.pdf'):
        name += '.pdf'

    writer = PdfWriter()
    for f in files:
        reader = PdfReader(BytesIO(f.read()))
        if reader.is_encrypted:
            reader.decrypt('')
        for p in reader.pages:
            writer.add_page(p)

    temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    writer.write(temp)
    temp.close()

    path = temp.name
    response = send_file(path, as_attachment=True, download_name=name)
    os.remove(path)
    return response

if __name__ == '__main__':
    app.run(debug=True)
