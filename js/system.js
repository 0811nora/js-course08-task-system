

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
            <td class="text-center"><a href="#" class="text-decoration-underline">${payState}</a></td>
            <td class="text-center"><button class="btn btn-alert deleteAloneBtn" data-id="${item.id}">刪除</button></td>
        </tr>
    `
}

function rankList(){
    let rankobj = {}
    ordersData.forEach((item)=>{
        item.products.forEach((i)=>{
            if(rankobj[i.title] === undefined){
                rankobj[i.title] = i.price;
            }else{
                rankobj[i.title] += i.price;
            }
        })
    })

    

    let rankArr = Object.entries(rankobj); 
    rankArr.sort((a,b)=> b[1] - a[1]);
    
    let top3 = rankArr.slice(0,3);
    let others = rankArr.slice(3);

    let orderSumPrice = 0;
    others.forEach(i => orderSumPrice += i[1])

    rankResult = [];
    top3.forEach( i => rankResult.push(i))
    rankResult.push(['其他', orderSumPrice]);


    if(rankArr.length === 0){
        let chartArea = document.querySelector('.chartArea');
        chartArea.innerHTML = `<div class="text-center fs-2 py-10 mx-auto" style="background-color: #dacbff5e; width: 500px;">暫無數據</div>`
    }else{
        renderChart();
    }
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

// ---- chart 圖表區 ----
function renderChart(){

    let chart = c3.generate({
        data: {
            // iris data from R
            columns: rankResult,
            type : 'pie',
            
        },
        color: {
            pattern: ['#5434A7','#7b58ceff', '#9D7FEA','#DACBFF', ]
        }
    });
}





