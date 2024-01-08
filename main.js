const server = "http://exam-2023-1-api.std-900.ist.mospolytech.ru";
const api = "c6ee856e-5b24-4d60-966a-4ed70a6a1134";

let routesList = []; // Список всех маршрутов
let filteredRoutesList = []; // Список отфильтрованных маршрутов
let currentPage = 1; // Текущая страница
let maxPage; // Максимальное число страниц
let currentRoute; // Выбранный маршрут
let currentGuide; // Выбранный гид
let guidesList = []; // Гиды для выбранного маршрута
let selectedLang = ""; // Выбранный язык гида
let selectedObject = "";

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Фильтрует маршруты
function filterRoutes() {
    filteredRoutesList = [];
    // Имя маршрута для фильрации
    let reqName = document.getElementById("routeName").value;

    for (let route of routesList) {
        // Фильтрация по имени
        if (route.name.includes(reqName)) {
            // Фильтрация по объекту
            if (route.mainObject.includes(selectedObject)) {
                filteredRoutesList.push(route);
            }
        }
    }
    maxPage = filteredRoutesList.length / 5;
    if (maxPage % 1 > 0) {
        maxPage = Math.floor(maxPage) + 1;
    }
    paginationWorker(1);
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
        paginationWorker(btn.innerHTML);
    };
    return btn;
}
function paginationWorker(page) {
    page = Number(page);
    currentPage = page;
    displayRoutes(page);

    let firstPageBtn = document.querySelector(".first-page-btn");
    let lastPageBtn = document.querySelector(".last-page-btn");
    let pageBtns = document.querySelector(".page-btns");
    pageBtns.innerHTML = "";

    let start = Math.max(page - 3, 1);
    let end = Math.min(page + 3, maxPage);
    for (let i = start; i <= end; i++) {
        pageBtns.appendChild(createPageButton(i));
    }
};

// Парсинг и вывод объектов в селектор
function objectParser() {
    let objects = [];
    let objSelector = document.getElementById("mainObject");
    let objectsList = [];

    for (let route of routesList) {
        objectsList.push(route.mainObject);
    };

    for (let cluster of objectsList) {
        let clusterObjects = cluster.split(" - ");
        for (let object of clusterObjects) {
            if (object.length > 40) {
                object = object.slice(0, 40);
            }
            if (!objects.includes(object)) {
                objects.push(object);
            }
        };
    };

    let option = document.createElement("option");
    option.innerHTML = "Не выбран";
    objSelector.appendChild(option);

    for (let object of objects) {
        let option = document.createElement("option");
        option.innerHTML = object;
        objSelector.appendChild(option);
    }
};

// Вывод маршрутов в таблицы по 5 элементов на страницу
function displayRoutes() {
    let table = document.getElementById("routes-table");
    let tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    let start = 5 * (currentPage - 1);
    let end = Math.min(currentPage * 5, filteredRoutesList.length);

    for (let i = start; i < end; i++) {
        let id = filteredRoutesList[i].id;
        let name = filteredRoutesList[i].name;
        let desc = filteredRoutesList[i].description;
        let objects = filteredRoutesList[i].mainObject;

        let trow = document.createElement("tr");

        if (filteredRoutesList[i].id == currentRoute) {
            trow.classList.add("table-secondary");
        }

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
        button.onclick = async function () {
            currentRoute = id;
            currentGuide = undefined;

            let rows = document.querySelectorAll("#routes-table tbody tr");
            for (let row of rows) {
                row.classList.remove("table-secondary");
            };

            this.closest("tr").classList.add("table-secondary");

            guidesList = await getGuides();
            displayGuides(guidesList);


            window.location.href = "#guides-table-link";
        };

        btnCell.appendChild(button);

        trow.appendChild(nameCell);
        trow.appendChild(descCell);
        trow.appendChild(objCell);
        trow.appendChild(btnCell);
        tbody.appendChild(trow);
    }
}

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
        return routes;
    } else {
        alert(res.status);
    }
};

function orderExcursion() {
    alert("Hello!");
}

function displayGuides() {
    // expFrom и expTo - опыт гида от и до соотвественно
    let guidesTable = document.getElementById("guides-table");
    let guidesSection = document.getElementById("guides-section");
    let expFrom = document.getElementById("expFrom").value;
    if (expFrom == "" || expFrom < 0) {
        document.getElementById("expFrom").value = 0;
        expFrom = 0;
    }
    let expTo = document.getElementById("expTo").value;

    if (expTo == "" || expTo < expFrom) {
        document.getElementById("expTo").value = expFrom;
        expTo = expFrom;
    }
    guidesSection.classList.remove("hidden");
    guidesTable.innerHTML = "";

    for (let guide of guidesList) {
        if (!selectedLang || selectedLang == guide.language) {
            if (expFrom <= guide.workExperience && expTo >= guide.workExperience) {
                let tr = document.createElement("tr");

                if (guide.id == currentGuide) {
                    tr.classList.add("table-secondary");
                }

                let nameCell = document.createElement("td");
                nameCell.innerHTML = guide.name;
                let langCell = document.createElement("td");
                langCell.innerHTML = guide.language;
                let expCell = document.createElement("td");
                expCell.innerHTML = guide.workExperience;
                let priceCell = document.createElement("td");
                priceCell.innerHTML = guide.pricePerHour;
                let btnCell = document.createElement("td");
                let button = document.createElement("button");
                button.classList.add("btn", "btn-primary", "px-2");
                button.innerHTML = "Выбрать";
                button.onclick = function () {
                    currentGuide = guide.id;

                    let rows = document.querySelectorAll("#guides-table tr");
                    for (let row of rows) {
                        row.classList.remove("table-secondary");
                    }

                    this.closest("tr").classList.add("table-secondary");

                }
                btnCell.appendChild(button);

                tr.appendChild(nameCell);
                tr.appendChild(langCell);
                tr.appendChild(expCell);
                tr.appendChild(priceCell);
                tr.appendChild(btnCell);

                guidesTable.appendChild(tr);
            }

        }
    }
}

async function getGuides() {
    let url = genURL(`routes/${currentRoute}/guides`);
    let guides = [];
    let languages = [];
    let res = await fetch(url);
    let langSelect = document.getElementById("langSelect");

    if (res.ok) {
        let json = await res.json();
        for (let guide of json) {
            guides.push(guide);
            if (!languages.includes(guide.language)) {
                languages.push(guide.language);
            }
        }

        langSelect.innerHTML = "";
        selectedLang = undefined;
        let option = document.createElement("option");
        option.innerHTML = "Любой";
        langSelect.appendChild(option);

        for (let language of languages) {
            let option = document.createElement("option");
            option.innerHTML = language;
            option.setAttribute("value", language);
            langSelect.appendChild(option);
        }
        return guides;
    } else {
        console.log(res.status);
    }

}

window.onload = async function () {
    let accountBtn = document.getElementById("accBtn");
    accountBtn.onclick = function () {
        window.location.href = "account.html";
    };
    routesList = await getRoutes();
    filterRoutes();
    displayRoutes(currentPage);
    paginationWorker(currentPage);
    objectParser();

    let nameInput = document.getElementById("routeName");
    nameInput.onchange = filterRoutes;

    let objSelect = document.getElementById("mainObject");
    objSelect.onchange = function () {
        selectedObject = objSelect[objSelect.selectedIndex].value;
        if (selectedObject == "Не выбран") {
            selectedObject = "";
        }
        filterRoutes();
    }

    let langSelect = document.getElementById("langSelect");
    langSelect.onchange = function () {
        selectedLang = langSelect[langSelect.selectedIndex].value;
        if (selectedLang == "Любой") {
            selectedLang = "";
        }
        displayGuides();
    };

    document.getElementById("expFrom").oninput = displayGuides;
    document.getElementById("expTo").oninput = displayGuides;

    document.querySelector(".first-page-btn").onclick = function () {
        paginationWorker(1);
    };
    document.querySelector(".last-page-btn").onclick = function () {
        paginationWorker(maxPage);
    };

};