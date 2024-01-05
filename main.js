const server = "http://exam-2023-1-api.std-900.ist.mospolytech.ru";
const api = "c6ee856e-5b24-4d60-966a-4ed70a6a1134";

let routesList = [];
let currentPage = 1;
let maxPage;

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Вывод маршрутов в таблицы по 5 элементов на страницу
function displayRoutes() {
    let table = document.getElementById("routes-table");
    let tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    let selector = document.getElementById("mainObject");
    selector.innerHTML = "";

    let start = 5 * (currentPage - 1);
    let end = Math.min(currentPage * 5, routesList.length);

    for (let i = start; i < end; i++) {
        let id = routesList[i].id;
        let name = routesList[i].name;
        let desc = routesList[i].description;
        let objects = routesList[i].mainObject;

        let trow = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.innerHTML = name;
        nameCell.classList.add("fw-semibold");
        let descCell = document.createElement("td");

        if (desc.length > 100) {
            desc = desc.slice(0, 100) + "...";
        }

        descCell.innerHTML = desc;

        let objCell = document.createElement("td");

        if (objects.length > 100) {
            objects = objects.slice(0, 100) + "...";
        }

        objCell.innerHTML = objects;

        let btnCell = document.createElement("td");
        let button = document.createElement("button");
        button.classList.add("btn", "btn-primary", "px-2");
        button.setAttribute("type", "button");
        button.innerHTML = "Выбрать";
        btnCell.appendChild(button);

        trow.appendChild(nameCell);
        trow.appendChild(descCell);
        trow.appendChild(objCell);
        trow.appendChild(btnCell);
        tbody.appendChild(trow);
    }
    // let selChild = document.createElement("option");
    // selChild.setAttribute("value", id);
    // selChild.innerHTML = name;
    // selector.appendChild(selChild);
}


function createPageButton(pageNum) {
    let btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.classList.add("btn", "btn-primary", "px-2", "mx-1");

    if (pageNum == currentPage) {
        btn.classList.add("current-page-button");
    }

    btn.innerHTML = pageNum;
    btn.onclick = function () {
        paginationWoker(btn.innerHTML);
    };
    return btn;
}

function paginationWoker(page) {
    page = Number(page);
    currentPage = page;
    displayRoutes(page);

    let firstPageBtn = document.querySelector(".first-page-btn");
    let lastPageBtn = document.querySelector(".last-page-btn");
    let pageBtns = document.querySelector(".page-btns");
    pageBtns.innerHTML = "";

    let start = Math.max(page - 3, 1);
    let end = Math.min(page + 3, maxPage);
    console.log(start, end, page - 3, page + 3);
    for (let i = start; i <= end; i++) {
        pageBtns.appendChild(createPageButton(i));
    }
};

// Получение списка маршрутов
async function getRoutes() {
    let url = genURL("routes");
    let res = await fetch(url);
    let routes = [];

    if (res.ok) {
        let json = await res.json();
        for (let route of json) {
            routes.push(route);
        }
        maxPage = routes.length / 5;
        if (maxPage % 1 > 0) {
            maxPage = Math.floor(maxPage) + 1;
        } 
        return routes;
    } else {
        alert(res.status);
    }
};

window.onload = async function () {
    let accountBtn = document.getElementById("accBtn");
    accountBtn.onclick = function () {
        window.location.href = "account.html";
    };
    routesList = await getRoutes();
    displayRoutes(currentPage);
    paginationWoker(currentPage);

    document.querySelector(".first-page-btn").onclick = function () {
        paginationWoker(1);
    };
    document.querySelector(".last-page-btn").onclick = function () {
        paginationWoker(maxPage);
    };

};