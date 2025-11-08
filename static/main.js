// 要素取得
const list = document.getElementById('list');
const addBtn = document.getElementById('addBtn');
const mergeBtn = document.getElementById('mergeBtn');

// [追加] ボタン押下時: 新しいPDF入力ブロックを生成
addBtn.onclick = () => {
  const wrap = document.createElement('div');
  wrap.className = 'p-2 border border-gray-200 rounded flex flex-col gap-2 bg-gray-50';

  // ファイル選択フィールド
  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'pdfs';
  input.accept = 'application/pdf';
  input.className = 'text-sm';

  // PDFプレビュー用キャンバス
  const preview = document.createElement('canvas');
  preview.className = 'border rounded self-center max-w-[120px]';
  preview.style.height = 'auto';

  // 並び替え / 削除ボタン生成
  const moveBtns = document.createElement('div');
  moveBtns.className = 'flex justify-end gap-2 text-sm';
  moveBtns.innerHTML = `
    <button type="button" class="text-blue-500 hover:text-blue-700">▲</button>
    <button type="button" class="text-blue-500 hover:text-blue-700">▼</button>
    <button type="button" class="text-red-500 hover:text-red-700">✕</button>
  `;

  const [up, down, del] = moveBtns.querySelectorAll('button');

  // ▲: 要素を1つ上へ
  up.onclick = () => list.insertBefore(wrap, wrap.previousElementSibling);
  // ▼: 要素を1つ下へ
  down.onclick = () => list.insertBefore(wrap.nextElementSibling, wrap);
  // ✕: 削除
  del.onclick = () => wrap.remove();

  // ファイル選択時: PDFの1ページ目をプレビュー描画
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);

    const v = page.getViewport({ scale: 0.15 });
    const ctx = preview.getContext('2d');
    preview.width = v.width;
    preview.height = v.height;

    await page.render({ canvasContext: ctx, viewport: v }).promise;
  };

  // 要素構築完了 → DOMに追加
  wrap.append(input, preview, moveBtns);
  list.append(wrap);
};

// [結合] ボタン押下時: PDFをサーバーへ送信して結合リクエスト
mergeBtn.onclick = async () => {
  const name =
    prompt("出力するPDFファイル名を入力してください（拡張子不要）例: index_10月分領収書") ||
    "merged.pdf";

  const formData = new FormData();
  // 各inputのファイルをFormDataに格納
  document.querySelectorAll('input[type=file]').forEach(f => {
    if (f.files[0]) formData.append('pdfs', f.files[0]);
  });
  formData.append('filename', name);

  // サーバーに結合リクエスト送信
  const res = await fetch('/merge', { method: 'POST', body: formData });
  if (!res.ok) return alert('結合に失敗しました');

  // 結合済みPDFをBlobとして受信 → 即時ダウンロード
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
};
