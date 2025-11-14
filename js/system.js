

const baseUrl = 'https://livejs-api.hexschool.io';
const api_path = 't1win';
const uid = 'Mh5rEk9CnzWtFxyaEguUEsO2Ifm2';

const auth = { 
    headers: {
        'Authorization': uid
    }
}

const orderList = document.querySelector('.orderList');
const deleteAllBtn = document.querySelector('.deleteAllBtn');

admGetOrder();
delAllBtn();

let ordersData = [];

let rankResult = [];

let categoryArr = [];



// [API:GET] 取得所有訂單資料
function admGetOrder(){
    axios.get(`${baseUrl}/api/livejs/v1/admin/t1win/orders`,auth)
        .then((res)=>{
            ordersData = res.data.orders
            loopOrderData();
            rankList();

        })
}



// 所有訂單資料渲染到畫面上
function loopOrderData(){
    let str = ``;
    ordersData.forEach((item)=>{
        let today = new Date(item.createdAt * 1000);
        let showDate = `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`
        let payState = item.paid ? "已處理" : "未處理";
        let title = item.products.map(i => i.title).join('<br>');

        str += renderOrderList(item,payState,title,showDate);
    })

    orderList.innerHTML = str;

    delAloneBtn();
    editState();

}


// ---- [渲染]訂單資料的html ----
function renderOrderList(item,payState,title,showDate){
    return `
        <tr >
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>${title}</td>
            <td class="text-center"><p>${showDate}</p></td>
            <td class="text-center">
                <button type="button" class="stateBtn btn border-0 text-decoration-underline fw-medium" data-bs-toggle="modal" data-bs-target="#stateBtn" data-id="${item.id}" style="color: #0067CE;">${payState}</button>
            </td>
            <td class="text-center"><button class="btn btn-alert deleteAloneBtn" data-id="${item.id}">刪除</button></td>
        </tr>

        <div class="modal fade" id="stateBtn" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4">
                <div class="modal-header border-0 ">
                <h5 class="modal-title " id="exampleModalLabel">是否更改狀態?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-footer border-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                <button type="button" class="stateConfirmBtn btn btn-primary" data-bs-dismiss="modal">確認</button>
                </div>
            </div>
            </div>
        </div>
    `
}


// ---- 圖表資料變動邏輯 ----
function rankList(){
    let rankobj = {};
    let categoryRank = {};

    ordersData.forEach((item)=>{

        item.products.forEach((i)=>{
            if(rankobj[i.title] === undefined){
                rankobj[i.title] = i.price;
            }else{
                rankobj[i.title] += i.price;
            }

            if(categoryRank[i.category] === undefined){
                categoryRank[i.category] = 1;
            }else{
                categoryRank[i.category] += 1;
            }
        })
    })

    console.log(categoryRank);

    

    let rankArr = Object.entries(rankobj); 
    categoryArr = Object.entries(categoryRank)
    console.log(categoryArr);
    rankArr.sort((a,b)=> b[1] - a[1]);
    
    let top3 = rankArr.slice(0,3);
    let others = rankArr.slice(3);

    let orderSumPrice = 0;
    others.forEach(i => orderSumPrice += i[1])

    rankResult = [];
    top3.forEach( i => rankResult.push(i))
    rankResult.push(['其他', orderSumPrice]);


    // if(rankArr.length === 0){
    //     let chartArea2 = document.querySelector('.chartArea2');
    //     chartArea2.innerHTML = `<div class="text-center fs-2 py-10 mx-auto" style="background-color: #dacbff5e; width: 500px;">暫無數據</div>`
    // }else{
    //     renderChart();
    // }

    // if(categoryArr.length === 0){
    //     let chartArea1 = document.querySelector('.chartArea1');
    //     chartArea1.innerHTML = `<div class="text-center fs-2 py-10 mx-auto" style="background-color: #cbe6ff5e; width: 500px;">暫無數據</div>`
    // }else{
    //     renderChart();
    // }

    checkAndRender('.chartArea1', categoryArr, '#cbe6ff5e');
    checkAndRender('.chartArea2', rankArr, '#dacbff5e');


}

function checkAndRender(chartAreaSelector, dataArr, emptyBgColor) {
    const chartArea = document.querySelector(chartAreaSelector);

    if (dataArr.length === 0) {
        chartArea.innerHTML = `
        <div class="text-center fs-2 py-10 mx-auto"
            style="background-color: ${emptyBgColor}; width: 500px;">
            暫無數據
        </div>`;
        return;
    }

    renderChart();
}




// ----- 點擊 [已處理 or 未處理] 時觸發 ------

function editState(){

    const stateBtn = document.querySelectorAll('.stateBtn');
    const stateConfirmBtn = document.querySelectorAll('.stateConfirmBtn')

    let id = "";
    let changeState;

    stateBtn.forEach((item)=>{
        item.addEventListener('click',(e)=>{
            id = e.target.dataset.id;
            if(e.target.textContent === "未處理"){
                changeState = true;
            }else{
                changeState = false
            }
        })
    })
    
    
    stateConfirmBtn.forEach((item)=>{
        item.addEventListener('click',(e)=>{
            ordersData.forEach((item)=>{
                if(item.id === id){
                    item.paid = changeState;
                }
            })
            putOrderState(id,changeState);
            
        })      
    })
}


// ---- ［API：put］修改訂單狀態
function putOrderState(id,changeState){
    let data = {
        "data": {
            "id": id,
            "paid": changeState
        }
    }
    axios.put(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,data,auth)
        .then(()=>{
            stateAlert();
            loopOrderData();

        })
        .catch(err => console.log(err))
}




// ---- ［API：delete］刪除單一項目
function delAloneOrder(id){
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${id}`,auth)
        .then(()=>{
            delAlert();
            admGetOrder();
        })
        .catch(err => console.log(err))
}



// ---- 點擊［刪除按鈕］時觸發 ----
function delAloneBtn(){
    const deleteAloneBtn = document.querySelectorAll('.deleteAloneBtn');

    deleteAloneBtn.forEach((item)=>{
        item.addEventListener('click',(e)=>{
            let id = e.target.dataset.id;
            delAloneOrder(id);
        })
    })

    
}

// ---- 點擊［全部刪除按鈕］時觸發 ----
function delAllBtn(){
    deleteAllBtn.addEventListener('click',()=>{
        axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,auth)
            .then(()=>{
                delAlert();
                admGetOrder();
            })
    })
    
}


// ---- ［通知］訂單成功刪除的通知 -----
function delAlert(){
    iziToast.show({
        title: '訂單已刪除',
        position: 'bottomLeft',
        color: 'green',
    });
}

// ---- ［通知］訂單成功刪除的通知 -----
function stateAlert(){
    iziToast.show({
        title: '訂單狀態已修改',
        position: 'bottomLeft',
        color: 'green',
    });
}

// ---- chart 圖表區 ----
function renderChart(){

    let chart1 = c3.generate({
        bindto: '#chart-category',
        data: {
            columns: categoryArr,
            type : 'pie',
            
        },
        color: {
            pattern: ['#2d47b8ff','#597bebff', '#8dacf0ff','#cbd7ffff', ]
        }
    });

    let chart2 = c3.generate({
        bindto: '#chart-product',
        data: {
            columns: rankResult,
            type : 'pie',
            
        },
        color: {
            pattern: ['#542db8ff','#8559ebff', '#a98df0ff','#DACBFF', ]
        }
    });

}





