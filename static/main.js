  
  // 各要素を取得:
  //list:PDFファイル(JSで生成) addBtn:プラスボタン mergeBtn:結合ボタン
  const list = document.getElementById('list'); 
  const addBtn = document.getElementById('addBtn');
  const mergeBtn = document.getElementById('mergeBtn');

  //addBtnを押したら新しい要素を作る、tailwind読み込ませるのでclassNameも定義
  //wrapについてはdiv要素でinputについてはPDFファイルの入力フォーム
  
  addBtn.onclick = () => {
    //inputタグを入れるdivタグの追加
    const wrap = document.createElement('div');
    wrap.className = 'p-2 border border-gray-200 rounded flex flex-col gap-2 bg-gray-50';

    //PDFを入力するinputタグの追加
    const input = document.createElement('input');

    //各要素は以下のようになる
    input.type = 'file';
    input.name = 'pdfs';
    input.accept = 'application/pdf';
    input.className = 'text-sm';

    //PDFのプレビューをするためにcanvasタグを追加　:キャンバス内にPDFの一ページ目を表示するため
    const preview = document.createElement('canvas');
    preview.className = 'border rounded self-center max-w-[120px]';
    preview.style.height = 'auto';

    //最後に順番を変更する為のbuttonの実装 divでまずは全体的な場所作りinnerHTMLで各buttonを挿入
    const moveBtns = document.createElement('div');
    
    //buttonはあくまで子要素なのでjustifyで配置を綺麗に整える
    moveBtns.className = 'flex justify-end gap-2 text-sm';
    
    //以下が順番を変更する為のbutton
    moveBtns.innerHTML = `
    <button type="button" class="text-blue-500 hover:text-blue-700">▲</button>
    <button type="button" class="text-blue-500 hover:text-blue-700">▼</button>
    <button type="button" class="text-red-500 hover:text-red-700">✕</button>`;

    //buttonの要素を押した時のアクションを定義
    //up down delって定義してないのに何故判断できるのか、分割代入でそれぞれの要素がup down delになる
    //move.Btnsのbuttonタグ達は▲▼×の順番なので分割代入として[0]の▲は、up=▲として定義されるようになる
    const [up, down, del] = moveBtns.querySelectorAll('button');
    
    //insertBefore:(何を、どこに入れるか)

    //previousElementSibling:直前
    //nextElementSibling:直後
    //なのでwrapはonclickで押されたwrapものが、該当し、previousElementSiblingは上にある同じ親の中にある要素へ
    //もし一番上なら順番変わらない、nextElementSiblingも同じ感じ
    up.onclick = () => list.insertBefore(wrap, wrap.previousElementSibling);
    down.onclick = () => list.insertBefore(wrap.nextElementSibling,wrap);
    //removeは単純に消す
    del.onclick = () => wrap.remove();

    //inputの要素が変更された時の処理　非同期処理を行う:処理が止まるので、裏で処理する必要がある為
    input.onchange = async () => {
      //配列の初期化
      const file = input.files[0];
      
      //なんも入らんかったらプレビュー表示しない
      if (!file) return;

      //buf:pdfを解析するためにpdfファイルの中身にある文字を取得 
      //pdf:bufをgetDocumentから解析し、pdfにする
      //page:解析したPDFのページ表示(最初のページ表示なのでgetpage(1)としている)
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const page = await pdf.getPage(1);

      //プレビューの大きさを指定する為の定義
      const v = page.getViewport({ scale: 0.15 });
      const ctx = preview.getContext('2d');
      preview.width = v.width; preview.height = v.height;
      
      //プレビューの大きさを指定
      await page.render({ canvasContext: ctx, viewport: v }).promise;
    };
    //プレビューを生成後、各buttonを挿入する
      wrap.append(input, preview, moveBtns);
      list.append(wrap);
    };

      //ここでAPIサーバーへpostする
      mergeBtn.onclick = async () => {
      //ファイル名をpromptで入力させる
      const name = prompt("出力するPDFファイル名を入力してください拡張子は不要です。　例:index 10月分領収書") || "merged.pdf";
     
      //FormDataのインスタンス生成、jsから格pdfを送る為
      const formData = new FormData();
      
      //selectorAllで全要素取得
      const fileInputs = document.querySelectorAll('[type=file]');
      
      //foreachでfileInputsの配列一つ一つをfとして吐き出し以下の処理を行う
      //filesについては、DOMオブジェクトのことでそれの[0]を取得する
      //appendでformDataに取得したものを入れる
      
      fileInputs.forEach(f => {
      if (f.files[0]) formData.append('pdfs', f.files[0]);
      });

      //filenameをpromptの値を入れる
      formData.append('filename', name);

      //mergeに移動後、postする　bodyにformDataを持たせて
      const res = await fetch('/merge', { method: 'POST', body: formData });
      
      //resがokではない場合はエラーとしてreturnする。
      if (!res.ok) return alert('結合に失敗しました');
      
      //blobでpythonから帰ってきたものを取得し、即時DLさせてる
      const blob = await res.blob();
      //aタグ作ってから自動でダウンロードさせるようにしてる
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
    };