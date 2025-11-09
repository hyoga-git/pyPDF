PDF Merge Tool

Flask と pypdf、それに PDF.js を組み合わせた PDF 結合アプリ。ブラウザでサムネイルを見ながら順番を並べ替え、任意のファイル名で一括ダウンロードできる。

主なポイント
・Tailwind CSS + PDF.js で視覚的にファイル管理
・▲ ▼ ボタンで順序を制御、✕で削除
・結合時に任意のファイル名を指定
・Flask + pypdf で暗号化されていない PDF をそのままマージ

必要なもの
・Docker / Docker Compose v2
・make（不要なら docker compose を直接使えば OK）

使い方（Docker 前提）
1) `docker compose build`
2) `docker compose up`（バックグラウンドは `docker compose up -d`）
3) ブラウザで http://127.0.0.1:5050/
4) 終了時は `docker compose down`

よく使う補助コマンド
・`docker compose logs -f` でログを追う
・`docker compose exec web /bin/bash` でコンテナに入る
・完全に消すなら `docker compose down --volumes --remove-orphans`

参考: Python を直接動かす場合
1) `python3 -m venv venv`
2) `source venv/bin/activate`
3) `pip install -r requirements.txt`
4) `python app/main.py`
この場合は http://127.0.0.1:5000/ でアクセス。

注意事項
・暗号化 PDF は事前に解除してからアップロード
・巨大ファイルはプレビュー生成に時間がかかる
・本番利用時は HTTPS やファイルサイズ制限などの対策を入れる

構成メモ
・`app/main.py` … Flask アプリ本体
・`app/templates/index.html` … UI テンプレート
・`app/static/main.js` … 入力ブロック管理と PDF プレビュー処理

ライセンスは用途に合わせて追記すること。

## 使い方
1. 画面上部の「＋ファイル追加」でファイル入力ブロックを必要なだけ増やす
2. それぞれのブロックに PDF を選択すると 1 ページ目のサムネイルが表示される
3. ▲/▼ ボタンで結合順を並べ替える（✕で削除）
4. 「PDFを結合」を押すとファイル名入力ダイアログが出るので任意の名前を入力
5. 結合処理が完了すると自動的にダウンロードが開始される

## 構成
- `main.py` : Flask アプリ本体。/merge で PDF を結合し、`send_file` で返却
- `templates/index.html` : 画面レイアウト。Tailwind と PDF.js の読み込みを行う
- `static/main.js` : 動的に入力ブロックを管理し、PDF プレビューと fetch POST を担う

## 注意
- 暗号化 PDF（パスワード付き）の場合は解除済みでアップロードしてください
- 大きなファイルやページ数の多い PDF はブラウザのプレビュー生成に時間がかかることがあります
