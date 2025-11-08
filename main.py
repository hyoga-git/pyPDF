

#flask:アプリ render_template:htmlを返す為 
#pypdf:PDFを操作するもの
#tempfile:一時ファイルを生成するもの os:ファイル消去に使用
# BytesIO:ファイルを一時的にメモリで扱う為のもの

from flask import Flask, render_template, request, send_file
from pypdf import PdfReader, PdfWriter
import tempfile, os
from io import BytesIO

#flask起動
app = Flask(__name__)

#ルートディレクトリー定義　index.htmlを表示させる
@app.route('/')
def index():
    return render_template('index.html')

#mergeに入った時に発火するPOSTの定義
@app.route('/merge', methods=['POST'])

def merge():
    #JSからpdfsを取得
    #{ method: 'POST', body: formData } JSが定義してるのはこれ
    files = request.files.getlist('pdfs')

    #JSでpromptから生成したfilenameを元にファイル名を作成する
    #送り方としてはFormDataで引数にfilenameと入れて送ってるがもしなければmergedになると定義してるから
    #コレを探させる
    name = request.form.get('filename', 'merged')

    #lowerについては大文字小文字どちらでも対応できるようにするもので
    #pdf Pdfでもpdfファイルとして読み込めるようにしてる
    #endswithで.pdfなら、pdfをつけない、ついてないなら最後につけるようにする。
    if not name.lower().endswith('.pdf'):
        name += '.pdf'

    #Pdfwriterのインスタンスを生成し、ライブラリのメソッド使えるようにする
    writer = PdfWriter()
    #送られてきたものを全て回す
    for f in files:
        #pdfを読む為のreaderのインスタンス生成、
        #引数はpdfにするのが普通だが、今回はメモリ上のデータなので
        #BytesIOで擬似メモリにfを一旦おいて、fを読む
        reader = PdfReader(BytesIO(f.read())
)
        #暗号化されているもの、パスワードがないけど暗号化されてるものを開く為
        if reader.is_encrypted:
            reader.decrypt('')
        #読んだものを１つずつ格納する
        for p in reader.pages:
            writer.add_page(p)
    #NamedTemporaryFileで一時的に使うファイルを作る 消去せず、拡張子はpdfで
    temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    #writerで保存したページをtempに上書きする
    writer.write(temp)
    #tempを保存し、完了させる
    temp.close()

    #pathを作成する、tempの名前で
    path = temp.name

    #最後にフロントに渡す、pathと、as_attachmentこれで自動ダウンロードにさせる
    #download_nameでダウンロードの名前を指定、
    response = send_file(path, as_attachment=True, download_name=name)
    #最後にpath 一時ファイルを消去する
    os.remove(path)
    return response

if __name__ == '__main__':
    app.run(debug=True)
