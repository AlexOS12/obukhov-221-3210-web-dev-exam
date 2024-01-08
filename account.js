const server = "http://exam-2023-1-api.std-900.ist.mospolytech.ru";
const api = "c6ee856e-5b24-4d60-966a-4ed70a6a1134";

let orderList = []; // Список всех заявок

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Отображение списка заявок
function displayOrders() {
    let table = document.getElementById("orders-table");
    let tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    for (let order of orderList) {
        let tr = document.createElement("tr");
        let id = order.id;
        let routeName = "Маршрут" + id;
        let date = order.date;
        let price = order.price;

        let idCell = document.createElement("td");
        idCell.innerHTML = id;
        let routeCell = document.createElement("td");
        routeCell.innerHTML = routeName;
        let dateCell = document.createElement("td");
        dateCell.innerHTML = date;
        let priceCell = document.createElement("td");
        priceCell.innerHTML = price;

        let btnCell = document.createElement("td");
        let viewBtn = document.createElement("i");
        viewBtn.classList.add("bi", "bi-eye");
        let editBtn = document.createElement("i");
        editBtn.classList.add("bi", "bi-pencil");
        let delBtn = document.createElement("i");
        delBtn.classList.add("bi", "bi-trash");

        btnCell.appendChild(viewBtn);
        btnCell.appendChild(editBtn);
        btnCell.appendChild(delBtn);

        tr.appendChild(idCell);
        tr.appendChild(routeCell);
        tr.appendChild(dateCell);
        tr.appendChild(btnCell);

        tbody.appendChild(tr);
    }
}

// Получение списка заявок
async function getOrders() {
    let url = genURL("orders");
    let res = await fetch(url);
    let orders = [];

    if (res.ok) {
        let json = await res.json();
        for (let order of json) {
            orders.push(order);
        }
        return orders;
    } else {
        alert(res.status);
    }
};

window.onload = async function () {
    let homeBtn = document.getElementById("homeBtn");
    homeBtn.onclick = function () {
        window.location.href = "index.html";
    };
    orderList = await getOrders();
    displayOrders();
};