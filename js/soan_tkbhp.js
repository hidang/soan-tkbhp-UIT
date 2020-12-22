//------------------------------------------------Declare--------------------------------------------------------------
const listColumns = [//22
  'STT', 'MaMH', 'MaLop', 'TenMH', 'MaGV',
  'TenGV', 'SiSo', 'SoTc', 'ThucHanh', 'HTGD',
  'Thu', 'Tiet', 'CachTuan', 'PhongHoc', 'KhoaHoc',
  'HocKy', 'NamHoc', 'HeDT', 'KhoaQL', 'NBD',
  'NKT', 'GhiChu'
];
const loading_data = document.getElementById('loading-data');
const box_header = document.getElementById('box-header');
const main_table = document.getElementById('main-table');
const main_table_body  = document.getElementById('main-table-body');
const danhsach_ten_selected = document.getElementById('danhsach-ten-selected');
const danhsach_info_selected = document.getElementById('danhsach-info-selected');
const danhsach_malop_selected = document.getElementById('danhsach-malop-selected');
const tongTC_selected = document.getElementById('tongTC-selected');
const text_input_malop = document.getElementById('text-input-malop');
var body_table_tkbhp = document.getElementsByClassName('body-table-tkbhp');
body_table_tkbhp = [...body_table_tkbhp];
var data_tkb = '';//Object dữ liệu từ file excel tất cả môn học
//🐥🐤🐣fix buggggg lần 2: hôm nay là một buổi chiều thứ 7 bất chợt chiếc lá rơi nhưng rụng xuống 2 chiếc giống nhau nhưng khác tính chất hóa học dẫn-đến-bugg-toàn-cục bầu ơi thương lấy bí cùng tuy rằng xóa code
//vì mỗi một code class không chỉ xuất hiện một lần- đối với các môn có 2 3 ngày học trở lên sẽ khác về thứ và tiết học phải check để không bị trùng
//check box Chọn khi bị click vào sẽ phải auto click cái liên quan (trùng mã MH) còn lại
//check box Chọn sẽ được định danh bằng Class={MãLớp} vì class có thể tồn tại ở nhiều element (getElementsByClassName ->HTML Collection[])
var MyCodeClassList = [];//Danh sách {MaMH} các lớp học đã chọn -> đã check trùng lịch mới được thêm vào
//info_lop là mảng chứa 1 dòng trong file data_input
//array_info_lop là mảng chứa mảng info các dòng data môn học trong data_input vì có môn học sẽ >1 dòng nhưng khác thứ, tiết học, chỉ giống mỗi tên , mã, 🙂
var MyInfoClassList = [];//Danh sách chứa {info} các lớp học đã chọn (bao gồm trùng MaMH nhưng khác thu tiet)
var listElementsCheckBox = [];//Mảng các element-checbox-Loc
var TongTc = 0;//số tính chỉ của danh sách đang chọn
var textforcopy_malop_list ='';//string
//--------------------------------------------------EndDeclare-------------------------------------------------------------
//--------------------------------------------------SetUp-------------------------------------------------------------
//push elementCheckBox to array
listColumns.forEach(element => {
  ////set size ALL BOX text-input 
  //document.getElementById(`cell-${element}`).size = 10;
  listElementsCheckBox.push(document.getElementById(element));
});
//set envent show/hide for elementCheckBoxs
listElementsCheckBox.forEach(element => {
  element.addEventListener('click', ()=>{
    ShowOrHideCol(element);
  });
});
//
document.getElementById('btnCopy').addEventListener('click', ButtonCopy);
document.getElementById('btn-input-xong').addEventListener('click', Input_nhanh_malop);
//---------------------------------------------------EndSetUp--------------------------------------------------------
async function CancelAll() {
  if (MyCodeClassList.length > 0) {//dọn hết những lựa chọn cũ nếu có
    var _MyInfoClassList = MyInfoClassList;
    try {
      //khúc này tương tự OunerData2List nhưng có sự thay đổi xíu vì data đầu vào là mảng riêng lể các info_lop 
      //chứ không phải là mảng chứ toàn bộ các mảng info lớp buồn ngủ nên viết lung tung
      //đã test và fix(2) ok nào rãnh sẽ viết lại cho đẹp bug nữa thì xóa luôn tính năng này
      _MyInfoClassList.forEach(array_info_lop => {
        MyInfoClassList = MyInfoClassList.filter(item => item.MaLop !== array_info_lop.MaLop);//remove
        MyCodeClassList = MyCodeClassList.filter(item => item !== array_info_lop.MaLop);//remove
        var id = array_info_lop.MaLop;
        id = id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");//vì dùng để tạo id nên phải xóa hết các kí tự đặc biệt "."...
        var thongtinmonhoc = document.getElementById(id);
        if (thongtinmonhoc){
          thongtinmonhoc.remove();//remove item khỏi info-danhsach-selected
        }
        //https://stackoverflow.com/questions/10572735/javascript-getelement-by-href
        var i_danhsach_selected = document.querySelector(`a[href='#${id}']`);//remove item khỏi danhsach-selected
        if (i_danhsach_selected) {//vì cấu trúc mảng MyInfoClassList là mảng info các lớp học đã chọn(mỗi dòng trong file excel) còn các i_danhsach_selected thì chỉ có 1 để hiển thị
          i_danhsach_selected.remove();
        }
        handle_show_danhsach_malop_selected();
        //handle_tongTC_selected
        if(array_info_lop.SoTc !== undefined) TongTc -= parseInt(array_info_lop.SoTc);
        tongTC_selected.innerHTML = TongTc;
        handle_show_body_table_tkbhp();
        //click all check box checked
        var checkboxChonCungMaLops = document.getElementsByClassName(array_info_lop.MaLop);//checkboxChonCungMaLops lúc này là HTML collection
        checkboxChonCungMaLops = [...checkboxChonCungMaLops];
        checkboxChonCungMaLops.forEach(checkBox => {//auto click checkbox cùng lớp học
          checkBox.checked = false;
        });
      });
    } catch (error) {
      console.log(error);
      ShowErrorByAlert(error);
    } finally {
      MyCodeClassList = [];
      MyInfoClassList = [];
      return;
    }
  }else{
    return;
  }
}
async function Input_nhanh_malop() {
  //vì học async chưa rành nên đây là một đống cức :v
  var text_malop = text_input_malop.value;
  if(!text_malop){
    ShowErrorByAlert(`Danh sách rỗng!`);
    return;
  }
  await CancelAll().then(async()=>{
    var malop_array = text_malop
                                .toUpperCase()//in hoa
                                .split('\n')//chặt mỗi dòng thành từng phần tử
                                .map(srt => srt.trim())//xóa kí tự khoảng trắng ở đầu và cuối
                                .filter(srt => srt !== '');//xóa ''
    //
    var array_info_lop, err, checkboxChonCungMaLops;
    for (const maLop of malop_array) {//check và InnerData
      array_info_lop = GetInfoClassByMaLopThuTiet(maLop);
      if(array_info_lop.length >0){
        err = await CheckTrungThuTiet(array_info_lop);
      if (!err) {
        checkboxChonCungMaLops = document.getElementsByClassName(array_info_lop[0].MaLop);//checkboxChonCungMaLops lúc này là HTML collection
        checkboxChonCungMaLops = [...checkboxChonCungMaLops];
        InnerData2List(array_info_lop);
        checkboxChonCungMaLops.forEach(checkBox => {//auto click checkbox
        checkBox.checked = true;
        });
      }else{
        await CancelAll().then(()=>{
        MyCodeClassList = [];//reset lai
        MyInfoClassList = [];//reset lai
        });
        ShowErrorByAlert(err);
        return;
      }
      }else{
        ShowErrorByAlert(`Mã lớp "${maLop}" không tồn tại xin kiểm tra lại!`);
      return;
      }
    }
    text_input_malop.value = '';
    alert("🎉Thêm thành công! Xem tkb của bạn ngay phía dưới.");
  });
}
function ButtonCopy() {
  var textArea = document.createElement("textarea");
  textArea.value = textforcopy_malop_list;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, 99999); /* For mobile devices */
  try {
    document.execCommand('copy');
  } catch (err) {
    ShowErrorByAlert(err);
  }
  document.body.removeChild(textArea);
}
function ReadJsonFile(file) {//return Promise resolve -> data in file json
  return new Promise(
    function (resolve) {
      var rawFile = new XMLHttpRequest();
      rawFile.overrideMimeType("application/json");
      rawFile.open("GET", file, true);
      rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
          resolve(rawFile.responseText);
        }//else resolve(null);
      }
      rawFile.send(null);
    }
  )
}
function GetInfoClassByMaLopThuTiet(maLop) {//return array [object info_lop] 
  var array_infoLop = [];//[]?true:false -> true //[].length===0
  if(data_tkb){
    for (const datalop of data_tkb) {
      if (datalop.MaLop == maLop) {
        array_infoLop.push(datalop);
      }
    }
  }else{
    console.log('read file data err');
    return [];//[]?true:false -> true //[].length===0
  }
  return array_infoLop;
}
function ShowOrHideCol(elementCheckBox) {
  //=>if checked ? show:hide -> elements
  var ShowOrHide = 'none';//hide
  if (elementCheckBox.checked) ShowOrHide = '';//show
  var listCell = document.getElementsByName(`cell-${elementCheckBox.id}`); 
  listCell.forEach(element =>{
    element.style.display  = ShowOrHide;
  });
}
function handle_show_danhsach_malop_selected() {
  var list_malop_show = '';
  textforcopy_malop_list ='';
  MyCodeClassList.forEach(element => {
    list_malop_show += `${element}</br>`;
    textforcopy_malop_list += `${element}\n`;
  });
  danhsach_malop_selected.innerHTML = list_malop_show;
}
function handle_show_body_table_tkbhp() {
  var br = '<br>';
  function getClassCell(info_lop) {
    if (info_lop.Thu == '*') {
      br =' '; 
    }
    return `<strong>${info_lop.MaLop} - ${info_lop.NgonNgu?info_lop.NgonNgu:''}</strong>${br}
${info_lop.TenMH}${br}
<strong>${info_lop.TenGV?info_lop.TenGV:''}</strong>${br}
${info_lop.PhongHoc?info_lop.PhongHoc:''}${br}
BĐ: ${info_lop.NBD?info_lop.NBD:''}${br}
KT: ${info_lop.NKT?info_lop.NKT:''}${br}
<button type="button" class="btn btn-danger btn-sm" onclick="DeleteMonHoc('${info_lop.MaLop}')">Bỏ chọn</button>
`
  }
  function getLessonTime(tiet) {
    //thanks anh "loia5tqd001" từ "github.com/loia5tqd001/Dang-Ky-Hoc-Phan-UIT" ❤
    switch (tiet) {
      case 1:
        return `<td class="align-middle">Tiết 1<br>(7:30-8:15)</td>`
      case 2:
        return `<td class="align-middle">Tiết 2<br>(8:15-9:00)</td>`
      case 3:
        return `<td class="align-middle">Tiết 3<br>(9:00-9:45)</td>`
      case 4:
        return `<td class="align-middle">Tiết 4<br>(10:00-10:45)</td>`
      case 5:
        return `<td class="align-middle">Tiết 5<br>(10:45-11:30)</td>`
      case 6:
        return `<td class="align-middle">Tiết 6<br>(13:00-13:45)</td>`
      case 7:
        return `<td class="align-middle">Tiết 7<br>(13:45-14:30)</td>`
      case 8:
        return `<td class="align-middle">Tiết 8<br>(14:30-15:15)</td>`
      case 9:
        return `<td class="align-middle">Tiết 9<br>(15:30-16:15)</td>`
      case 10:
        return `<td class="align-middle">Tiết 10<br>(16:15-17:00)</td>`
    }
  }
  var data_table = '', tiet_ne, flag ;
  for (let tiet = 1; tiet <= 10; tiet++) {//mỗi dòng là 1 tiết học
    data_table += `<tr>${getLessonTime(tiet)}`;//cột thứ/tiết
    tiet_ne = tiet=== 10 ? 0: tiet;
    for (let thu = 2; thu <= 7; thu++) {//cột 2->7
      flag = false;
      MyInfoClassList.forEach(element => {
        if (parseInt(element.Thu) == thu & (element.Tiet.toString()).includes(tiet_ne.toString())) {
          if((element.Tiet.toString())[0] == tiet_ne.toString()){
            data_table += `<td rowspan="${element.Tiet.length}" name="cell-monhocINtkb">${getClassCell(element)}</td>`;
          }
          flag = true;
        }
      });
      if(!flag){
        flag = false;
        data_table+=`<td></td>`
      }
    }
    data_table += '</tr>';
  }
  MyInfoClassList.forEach(element => {
    if (!parseInt(element.Thu)) 
      data_table += `<tr><td colspan="7" class="align-middle" name="cell-monhocINtkb">${getClassCell(element)}</td></tr>`;
  });
  
  body_table_tkbhp.forEach(element => {
    element.innerHTML = data_table;
  });
}
function InnerData2List(array_infolop) {//add codeclass to MyCodeClassList and Inner Data to site
  //TODO:innerHTML ra list nav
  // danhsach_ten_selected: List   //<a class="list-group-item list-group-item-action" data-bs-toggle="list" href="#list-home" role="tab">Demo1</a>
  // danhsach_info_selected: Info for List  //<div class="tab-pane fade" id="list-home" role="tabpanel">Demo1</br>Demo1</br>Demo1</br>Demo1</div>
  var thu_tiet ='';
  array_infolop.forEach(info_lop => {
    MyInfoClassList.push(info_lop);//phải push hết vào để get info tkb
    thu_tiet += `*thứ: ${info_lop.Thu}-tiết: ${info_lop.Tiet} `;
  });
  MyCodeClassList.push(array_infolop[0].MaLop);//chỉ cần push một mã lớp đại diện
  var id = array_infolop[0].MaLop;
  id = id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");//vì dùng để tạo id nên phải xóa hết các kí tự đặc biệt "."...

  danhsach_ten_selected.innerHTML += 
  `<a class="list-group-item-success mt-1" data-bs-toggle="list" href="#${id}" role="tab" style="text-decoration: none;border-style: solid;">${array_infolop[0].TenMH}</a>`;
  danhsach_info_selected.innerHTML +=
  `<div class="tab-pane fade" id="${id}" role="tabpanel">
<b>Tên môn học:</b> ${array_infolop[0].TenMH}</br><b>Mã lớp:</b> ${array_infolop[0].MaLop}</br>
<b>Thứ-Tiết:</b> ${thu_tiet?thu_tiet:'*'}</br>
<b>GV</b>: ${array_infolop[0].TenGV?array_infolop[0].TenGV:'*'}</br>
<b>HệĐT</b>: ${array_infolop[0].HeDT?array_infolop[0].HeDT:'*'} <b>Phòng học:</b> ${array_infolop[0].PhongHoc?array_infolop[0].PhongHoc:'*'} <b>SốTC:</b> ${array_infolop[0].SoTc?array_infolop[0].SoTc:'*'}
<b>HTGD:</b> ${array_infolop[0].HTGD?array_infolop[0].HTGD:'*'}</br>
<b>TH:</b> ${array_infolop[0].ThucHanh?array_infolop[0].ThucHanh:' '} <b>GhiChú:</b> ${array_infolop[0].GhiChu?array_infolop[0].GhiChu:'*'}
</br>
<button type="button" class="btn btn-danger btn-sm" onclick="DeleteMonHoc('${array_infolop[0].MaLop}')">Bỏ chọn môn học này</button>
</div>`;
  handle_show_danhsach_malop_selected();
  //handle_tongTC_selected
  if(array_infolop[0].SoTc !== undefined) TongTc += parseInt(array_infolop[0].SoTc);
  tongTC_selected.innerHTML = TongTc;
  handle_show_body_table_tkbhp();
}
function OutnerData2List(array_infolop) {//remove codeclass to MyCodeClassList, MyCodeClassList and Data in HTML
  MyInfoClassList = MyInfoClassList.filter(item => item.MaLop !== array_infolop[0].MaLop);//remove
  MyCodeClassList = MyCodeClassList.filter(item => item !== array_infolop[0].MaLop);//remove
  var id = array_infolop[0].MaLop;
  id = id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");//vì dùng để tạo id nên phải xóa hết các kí tự đặc biệt "."...
  document.getElementById(id).remove();//remove item khỏi info-danhsach-selected
  //https://stackoverflow.com/questions/10572735/javascript-getelement-by-href
  var i_danhsach_selected = document.querySelector(`a[href='#${id}']`);
  i_danhsach_selected.remove();//remove item khỏi show-danhsach-selected
  handle_show_danhsach_malop_selected();
  //handle_tongTC_selected
  if(array_infolop[0].SoTc !== undefined) TongTc -= parseInt(array_infolop[0].SoTc);
  tongTC_selected.innerHTML = TongTc;
  handle_show_body_table_tkbhp();
}
function DeleteMonHoc(malop) {
  // //https://stackoverflow.com/questions/6267816/getting-element-by-a-custom-attribute-using-javascript
  // var checkBoxChon =  document.querySelector(`input[value-malop="${malop}"]`);
  var checkBoxChons =  document.getElementsByClassName(malop);
  checkBoxChons = [...checkBoxChons];
  var aray_info_lop = GetInfoClassByMaLopThuTiet(malop);//FIXME: có thể get từ mảng MyInfoClassList[];
  checkBoxChons.forEach(checkBoxChon => {
    checkBoxChon.checked = false;
  });
  OutnerData2List(aray_info_lop);
}
async function CheckAndAddClass2ListChon(checkboxChon) {
  var maLop = checkboxChon.getAttribute('value-malop');
  var array_infolop = GetInfoClassByMaLopThuTiet(maLop);//info_lop is array
  var checkboxChonCungMaLops = document.getElementsByClassName(maLop);//checkboxChonCungMaLops lúc này là HTML collection
  checkboxChonCungMaLops = [...checkboxChonCungMaLops];//https://stackoverflow.com/questions/222841/most-efficient-way-to-convert-an-htmlcollection-to-an-array
  if (checkboxChon.checked) {
    var err = await CheckTrungThuTiet(array_infolop);
    if (!err) {
      InnerData2List(array_infolop);
      checkboxChonCungMaLops.forEach(checkBox => {//auto click checkbox cùng lớp học
        checkBox.checked = true;
      });
    }else{
      checkboxChon.checked = false;
      ShowErrorByAlert(err);
    }
  }else{
    checkboxChonCungMaLops.forEach(checkBox => {//auto click checkbox cùng lớp học
      checkBox.checked = false;
    });
    OutnerData2List(array_infolop);
  }
}
function ShowErrorByAlert(err) {
  alert("Lỗi: " + err);
}
function CheckTrungThuTiet(array_inputlop) {//return (Promise-function) resolve->(false -> không bị trùng | err) 
  return new Promise(
    function (resolve) {
      if(MyInfoClassList){
        var ThuTrung, e_Tiet, i_Tiet;
        array_inputlop.forEach(input_lop => {
          ThuTrung = [];
          if(input_lop.Thu != '*' & input_lop.Thu != '' & input_lop.Tiet != '*' & input_lop.Tiet != ''){
            MyInfoClassList.forEach(e_lop => {
              if (e_lop.Thu === input_lop.Thu) {
                ThuTrung.push(e_lop);
              }
            });
            if(ThuTrung){
              try {
                ThuTrung.forEach(e_lop => {
                  e_Tiet = e_lop.Tiet;
                  i_Tiet = input_lop.Tiet;
                  for (const e of e_Tiet) {
                    for (const i of i_Tiet) {
                      if (e === i){
                        throw '📢Trùng thời gian học với môn:\n'+e_lop.TenMH+' - Thứ: '+e_lop.Thu+' Tiết: '+e_lop.Tiet;//err
                      }
                    }
                  }
                });
              } catch (err) {
                return resolve(err);
              }
            }
          }
        });
      }else resolve(false);
      resolve(false);
    }
  );
}
//------------------------------------------------Start()---------------------------------------------------------
async function Start() {
  //TODO:tạm ẩn table, show loading để đợi xử lý xong dữ liệu
  loading_data.style.display = "";
  box_header.style.display = "none";
  main_table.style.display = "none";
  //FIXME: Chưa hoàn thành tính năng add file excel của user

  var jsondata = await ReadJsonFile("./tkbhp.json");
  var data_json = JSON.parse(jsondata);
  data_tkb = data_json.data;


  //TODO:render data table
  var i_data, cell_data;
  var dataTable ='';
  var lineTable ='';
  var l = data_tkb.length;
  for (let index = 0; index < l; index++) {
    i_data = data_tkb[index];
    if (i_data.TenMH && i_data.TenMH !== "TÊN MÔN HỌC") {//check data json môn học unknown - không tồn tại
      //fixed: TH có >= 2 mã lớp /1 lớp 🙂
      //----------------------
      //TODO- Tạo dòng
      //mỗi checkboxChon sẽ mang "value-malop" "value-thu" "value-tiet" chính là "mã lớp"-"thứ"-"tiết" tương ứng với dòng nó,        
      lineTable =`<td name="cell-Chon"><input type="checkbox" name="cell-Chon-CheckBox" class="form-check-input ${i_data.MaLop}"
value-malop="${i_data.MaLop}" ></td>`;    
      //value-thu="${i_data.Thu}" value-tiet="${i_data.Tiet}"
      for (const element of listColumns) {
        //https://stackoverflow.com/questions/922544/using-variable-keys-to-access-values-in-javascript-objects
        //console.log((data_tkb[index])[element]);
        cell_data = i_data[element];
        if(!cell_data) cell_data = '';//check data unknown
        lineTable += `<td name="cell-${element}">${cell_data}</td>`;
      }
      //TODO- thêm DÒNG vào BẢNG sau khi xử lý xong
      dataTable +=`<tr>${lineTable}</tr>`;
    }
  }
  //TODO: ẩn loading hiện site lại sau khi xử lý xong
  loading_data.style.display = "none";
  box_header.style.display = "";
  main_table.style.display = "";
  //đưa dữ liệu đã xử lý vào bảng
  main_table_body.innerHTML = dataTable; 

  //TODO:add event select for Checkbox Chon
  var listCellChon = document.getElementsByName("cell-Chon-CheckBox");
  //add action click CheckAndAddClass2ListChon() for ChexBoxChonsss
  listCellChon.forEach(checkboxChon => {
    checkboxChon.addEventListener('click', ()=>{
      CheckAndAddClass2ListChon(checkboxChon);
    })
  });
  
  //TODO:check all Lọc to Show Or Hide CheckBox-Loc
  listElementsCheckBox.forEach(element => {
    ShowOrHideCol(element);
  });
  return;
}
Start()
  .then(()=>{
    window.mobileCheck = function() {
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };
    //vì lag nên chỉ thử nghiệm plugin trên trình duyệt máy tính, trình duyệt mobile bị lag tung tóe không dùng được
    if (!mobileCheck()) {
      //https://github.com/chestercharles/excel-bootstrap-table-filter
      $(function() {
        // Apply the plugin filter-table
        $('#main-table').excelTableFilter({
          columnSelector: '.apply-filter',    // (optional) if present, will only select <th> with specified class
          sort: true,                         // (optional) default true
          search: false                       // (optional) default true
        });
      });
    }

  })
//design by hidang on github: github.com/hidang
