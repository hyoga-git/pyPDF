const list = document.getElementById('list');
const addBtn = document.getElementById('addBtn');
const mergeBtn = document.getElementById('mergeBtn');

addBtn.onclick = () => {
  const wrap = document.createElement('div');
  wrap.className = 'p-2 border border-gray-200 rounded flex flex-col gap-2 bg-gray-50';

  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'pdfs';
  input.accept = 'application/pdf';
  input.className = 'text-sm';

  const preview = document.createElement('canvas');
  preview.className = 'border rounded self-center max-w-[120px]';
  preview.style.height = 'auto';

  const moveBtns = document.createElement('div');
  moveBtns.className = 'flex justify-end gap-2 text-sm';
  moveBtns.innerHTML = `
    <button type="button" class="text-blue-500 hover:text-blue-700">▲</button>
    <button type="button" class="text-blue-500 hover:text-blue-700">▼</button>
    <button type="button" class="text-red-500 hover:text-red-700">✕</button>
  `;

  const [up, down, del] = moveBtns.querySelectorAll('button');
  up.onclick = () => list.insertBefore(wrap, wrap.previousElementSibling);
  down.onclick = () => list.insertBefore(wrap.nextElementSibling, wrap);
  del.onclick = () => wrap.remove();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);
    const v = page.getViewport({ scale: 0.15 });
    const ctx = preview.getContext('2d');
    preview.width = v.width; preview.height = v.height;
    await page.render({ canvasContext: ctx, viewport: v }).promise;
  };

  wrap.append(input, preview, moveBtns);
  list.append(wrap);
};

mergeBtn.onclick = async () => {
  const name = prompt("出力するPDFファイル名を入力してください拡張子は不要です。　例:index 10月分領収書") || "merged.pdf";

  const formData = new FormData();
  document.querySelectorAll('input[type=file]').forEach(f => {
    if (f.files[0]) formData.append('pdfs', f.files[0]);
  });
  formData.append('filename', name);

  const res = await fetch('/merge', { method: 'POST', body: formData });
  if (!res.ok) return alert('結合に失敗しました');
  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
};