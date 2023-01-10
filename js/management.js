gnb("management", "status");

//관리자/매니저 리스트
async function getAdminList(){
    const url = apiURL('e-admin/get-admin-list/');
    await fetch(url, {
        method:'get',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'nurse '+cookie
        }
    })
    .then(response => response.json())
    .then(data => {
        appendAdminList(data);
    })
}
getAdminList();

//관리자/매니저 리스트 돔 생성
function appendAdminList(data){
    $(".table-admin-list > tbody").empty();
    data.sort((a,b)=>{return b.id-a.id});
    
    $.each(data, (idx,account)=>{
        $(".table-admin-list > tbody").append(
            '<tr id="nurse-'+account.id+'">'+
            '    <td>'+(idx+1)+'</td>'+
            '    <td>'+account.created_at.split("T")[0]+'</td>'+
            '    <td>'+account.user_id+'</td>'+
            '    <td>'+account.name+'</td>'+
            '    <td class="state-type-'+account.id+'">'+(account.is_admin ? '관리자':'매니저 간호사')+'</td>'+
            '    <td class="table-action"><a class="modify-admin" id="'+account.id+'"><i class="align-middle me-2 fas fa-fw fa-pencil-alt"></i></a></td>'+
            '</tr>'
        )
    })
}

//계정 생성 입력 확인
function inputCheck(){
    const uid = $("#uid").val();
    const password = $("#password").val();
    const name = $("#name").val();
    const email = $("#email").val();
    const isAdmin = $("#isAdmin").val();
    if(uid.length == 0 || password.length == 0 || name.length == 0){
        alert("정보를 모두 입력해주세요.");
        return false;
    }
    return true;
}

//계정 생성 완료 후 입력 초기화
function initCreate(){
    $("#addAdmin").modal("hide");
    $("#uid").val("");
    $("#password").val("");
    $("#name").val("");
    $("#email").val("");
    $("#isAdmin").val("");
}

//관리자 계정 생성
async function createAdmin(sendData){
    const url = apiURL('e-admin/create/');
    const response = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'nurse '+cookie
        },
        body: JSON.stringify(sendData)
    })
    .then(response => {
        if(!response.ok){
            throw response;
        }
        return response.json()
    })
    .then(data => {
        initCreate();
        getAdminList();
    })
    .catch(error => {
        alert("처리되지 않았습니다.");
        error.text().then(msg => {
            const message = JSON.parse(msg).message;
            alert(message);
        });
    })
}

//관리자 권한 변경
async function updateAdmin(sendData){
    const url = apiURL('e-admin/update-group/');
    const response = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'nurse '+cookie
        },
        body: JSON.stringify(sendData)
    })
    .then(response => response.json())
    .then(data => {
        getAdminList();
    })
}

//어드민 정보 수정
$(document).on("click",".modify-admin",function(){
    const id = $(this).attr("id");  //nurse_pk
    const beforeValue = $(".state-type-"+id).text();    //원래 값
    $(this).html("");
    $(this).after('<div class="modify-complete" id="'+id+'"><i class="align-middle me-2 fas fa-fw fa-check"></i></div>');
    $(".state-type-"+id).html(
        '<select class="form-select flex-grow-1 select-type-'+id+'">'+
        '	<option value="관리자">관리자</option>'+
        '	<option value="매니저 간호사">매니저 간호사</option>'+
        '</select>'
    );
    $(".select-type-"+id).val(beforeValue).prop("selected",true);
})

//어드민 정보 수정 완료
$(document).on("click",".modify-complete",function(){
    const id = $(this).attr("id");
    const value = $(".select-type-"+id+":selected").val();
    const isAdmin = (value == '관리자' ? true : false); 
    const sendData = {
        'nurse_pk':id,
        'is_admin': isAdmin,
        'is_manager': !isAdmin
    }
    $(this).prev().html('<i class="align-middle me-2 fas fa-fw fa-pencil-alt"></i>');
    $(this).remove();
    updateAdmin(sendData);
})

//저장
$(".btn-complete").on("click",function(){
    const isAdmin = $("#isAdmin").val() == 'admin' ? true : false;
    const sendData = {
        "user_id": $("#uid").val(),
        "password": $("#password").val(),
        "name": $("#name").val(),
        "is_admin": isAdmin,
        "is_manager": !isAdmin,
    }
    const check = inputCheck();
    if(check){
        createAdmin(sendData);
    }
})