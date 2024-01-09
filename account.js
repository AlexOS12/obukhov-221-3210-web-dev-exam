const server = "http://exam-2023-1-api.std-900.ist.mospolytech.ru";
const api = "c6ee856e-5b24-4d60-966a-4ed70a6a1134";

let orderList = []; // Список всех заявок
let currentPage = 1; // Текущая страница

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Удаление заявки
async function deleteOrder(eventer) {
    let orderId = eventer.getAttribute("orderId");
    let url = genURL(`orders/${orderId}`);

    let res = await fetch(url, {
        method: "DELETE"
    })
    if (res.ok) {
        orderList = await getOrders();
        paginationWorker(currentPage);
    } else {
        alert(res.status);
    }
}

// Заполнение формы просмотра
async function fillForm(orderId) {
    let url = genURL(`orders/${orderId}`);
    let res = await fetch(url);

    if (!res.ok) {
        console.log(res.status);
        return;
    }
    let order = await res.json();

    let guideNameField = document.getElementById("guideName");
    let guide = await getGuide(order.guide_id);
    guideNameField.innerHTML = guide.name;

    let routeNameField = document.getElementById("nameRoute");
    let route = await getRoute(order.route_id);
    routeNameField.innerHTML = route.name;

    let dateField = document.getElementById("excDate");
    dateField.innerHTML = order.date;

    let timeField = document.getElementById("excTime");
    timeField.innerHTML = order.time;

    let durationField = document.getElementById("excDuration");
    if (order.duration == 1) {
        durationField.innerHTML = "1 час";
    } else {
        durationField.innerHTML = `${order.duration} часа`;
    }

    let peopleField = document.getElementById("excPeople");
    peopleField.innerHTML = order.persons;

    let priceField = document.getElementById("totalPrice");
    priceField.innerHTML = order.price;

    let quickGuide = document.getElementById("quickGuide");
    if (!order.optionFirst) {
        quickGuide.classList.add("hidden");
    } else {
        quickGuide.classList.remove("hidden");
    }

    let quickGuideField = document.getElementById("quickGuidePrice");
    let quickGuidePrice = guide.pricePerHour * order.duration * 0.3;
    quickGuideField.innerHTML = `${Math.floor(quickGuidePrice)} &#8381; (30%)`;

    let sli = document.getElementById("sliDiv")
    if (!order.optionSecond) {
        sli.classList.add("hidden");
    } else {
        sli.classList.remove("hidden");
    }
    let sliField = document.getElementById("sliPrice");
    let sliPercent = order.persons > 10 ? 25 : 15;
    let sliPrice = guide.pricePerHour * order.duration * (sliPercent / 100);
    sliField.innerHTML = `${Math.floor(sliPrice)} &#8381; (${sliPercent}%)`;
};

// Отображение списка заявок
async function displayOrders() {
    let table = document.getElementById("orders-table");
    let tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    let start = 5 * (currentPage - 1);
    let end = Math.min(start + 5, orderList.length);

    // for (let order of orderList) {
    for (let i = start; i < end; i++) {
        let order = orderList[i];
        let tr = document.createElement("tr");
        let id = order.id;
        let route = await getRoute(order.route_id);
        let date = order.date;
        let price = order.price;

        let idCell = document.createElement("td");
        idCell.innerHTML = id;
        let routeCell = document.createElement("td");
        routeCell.innerHTML = route.name;
        let dateCell = document.createElement("td");
        dateCell.innerHTML = date;
        let priceCell = document.createElement("td");
        priceCell.innerHTML = price;

        let btnCell = document.createElement("td");
        let viewBtn = document.createElement("i");
        viewBtn.classList.add("bi", "bi-eye");
        viewBtn.setAttribute("data-bs-toggle", "modal");
        viewBtn.setAttribute("data-bs-target", "#view-modal");
        viewBtn.onclick = function () {
            fillForm(order.id);
        }
        let editBtn = document.createElement("i");
        editBtn.classList.add("bi", "bi-pencil");
        let delBtn = document.createElement("i");
        delBtn.setAttribute("data-bs-toggle", "modal");
        delBtn.setAttribute("data-bs-target", "#deleteModal");
        delBtn.onclick = function () {
            let confButton = document.getElementById("delConfirm");
            confButton.setAttribute("orderId", order.id);
        };
        delBtn.classList.add("bi", "bi-trash");

        btnCell.appendChild(viewBtn);
        btnCell.appendChild(editBtn);
        btnCell.appendChild(delBtn);

        tr.appendChild(idCell);
        tr.appendChild(routeCell);
        tr.appendChild(dateCell);
        tr.appendChild(priceCell);
        tr.appendChild(btnCell);

        tbody.appendChild(tr);
    }
}

function paginationWorker(page) {
    let maxPage = Math.ceil(orderList.length / 5);
    let pgBtns = document.getElementById("pageBtns");
    pgBtns.innerHTML = "";

    currentPage = Math.min(page, maxPage);

    for (let i = 1; i <= maxPage; i++) {
        let pageItem = document.createElement("li");
        pageItem.setAttribute("href", "#orders-table");
        pageItem.classList.add("page-item");
        if (i == currentPage) {
            pageItem.classList.add("active");
        } else {
            pageItem.onclick = function () {
                paginationWorker(i);
            }
        }
        let pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.setAttribute("href", "#orders-table");
        pageLink.innerHTML = i;
        pageItem.appendChild(pageLink);
        pgBtns.appendChild(pageItem);
    }

    displayOrders();
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

// Получение списка маршрутов
async function getRoute(routeId) {
    let url = genURL(`routes/${routeId}`);
    let res = await fetch(url);

    if (res.ok) {
        let route = await res.json();
        return route;
    } else {
        alert(res.status);
    }
};

// Получение списка гидов
async function getGuide(guideId) {
    let url = genURL(`guides/${guideId}`);
    let res = await fetch(url);

    if (res.ok) {
        let guide = await res.json();
        return guide;
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
    paginationWorker(1);
};