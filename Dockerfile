# ベースイメージ
FROM python:latest

# 作業ディレクトリ
WORKDIR /app

# 依存関係をコピー
COPY requirements.txt .

# パッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションをコピー これすることでdocker内でhtml js pyが使えるようになる
COPY ./app .

# Flaskを起動
CMD ["python", "main.py"]
