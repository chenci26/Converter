import XLSX from 'xlsx';
import * as R from 'ramda';

const getElementById = (id) => document.getElementById(id);

const addEvent = R.curry((event, callback, target) => target.addEventListener(event, callback));

const addClick = addEvent('click');

const logError = (msg) => console.error(msg);

const toJson = R.thunkify((target) => {
  const $file = target;
  const selectedFile = $file.files[0];
  if (!selectedFile) {
    alert('請先選擇檔案');
    return;
  }
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event?.target?.result;
    if (!data) {
      alert('資料格式錯誤');
      return;
    }

    const getWorkboox = (curData) => XLSX.read(curData, {
      type: 'binary'
    });

    const outputJson = R.curry((book, sheetName) => {
      const row = XLSX.utils.sheet_to_row_object_array(book.Sheets[sheetName]);
      return row;
    })

    const [rowArr] = R.pipe(
      getWorkboox,
      R.converge(R.map, [R.unary(outputJson), R.prop('SheetNames')]),
    )(data)

    console.log(rowArr[0])
    const json = document.getElementById('json');
    json.textContent = JSON.stringify(rowArr[0])
  }

  reader.onerror = (event) => {
    logError("File could not be read! Code " + event?.target?.error?.code);
  };

  reader.readAsBinaryString(selectedFile);
})

const addToJsonEvent = R.pipe(
  getElementById,
  addClick(toJson(getElementById('file'))),
);

addToJsonEvent('format');