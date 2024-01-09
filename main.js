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
let selectedObject = ""; // Выбранный объект
let messageBox; // Для уведомлений (alert)

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Отображение уведомлений
function displayAlert(message, status = "good") {
    // Статусы:
    // good - уведомление об успехе
    // attention - информационное сообщение
    // error - уведомление об ошибке
    
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("bg-opacity-75", "rounded", "text-center");
    let messageHeader = document.createElement("h5");
    if (status == "good") {
        messageHeader.innerHTML = "Успех!";
        messageDiv.classList.add("bg-success");
    } else if (status == "attention") {
        messageHeader.innerHTML = "Внимание!";
        messageDiv.classList.add("bg-warning");
    } else {
        messageHeader.innerHTML = "Ошибка!";
        messageDiv.classList.add("bg-danger");
    }
    let messageText = document.createElement("p");
    messageText.innerHTML = message;
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageText);

    messageBox.appendChild(messageDiv);

    setTimeout(() => messageDiv.remove(), 2000);
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
        displayAlert(res.status, "error");
    }

}

function displayGuides() {
    // expF и expT - опыт гида от и до соотвественно
    let guidesTable = document.getElementById("guides-table");
    let guidesSection = document.getElementById("guides-section");
    let expF = document.getElementById("expFrom").value;

    if (expF == "") {
        expF = 0;
    } else if (expF < 0) {
        document.getElementById("expFrom").value = 0;
        expF = 0;
    }
    expF = Number(expF);

    let expT = document.getElementById("expTo").value;
    if (expT == "") {
        expT = Infinity;
    } else {
        expT = Number(expT);
    }

    if (expT < expF) {
        document.getElementById("expTo").value = expF;
        expT = expF;
    }
    
    guidesSection.classList.remove("hidden");
    guidesTable.innerHTML = "";

    for (let guide of guidesList) {
        if (!selectedLang || selectedLang == guide.language) {
            if (expF <= guide.workExperience && expT >= guide.workExperience) {
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

                    if (currentGuide && currentRoute) {
                        let orderSection;
                        orderSection = document.getElementById("order-section");
                        orderSection.classList.remove("hidden");
                        window.location.href = "#order-section";
                    }
                };
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

            let orderSection = document.getElementById("order-section");
            orderSection.classList.add("hidden");

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

// Работа с пагинацией
function paginationWorker(page) {
    let maxPage = Math.ceil(filteredRoutesList.length / 5);
    let pgBtns = document.getElementById("pageBtns");
    pgBtns.innerHTML = "";

    currentPage = Math.min(page, maxPage);

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(maxPage, page + 2);

    // создание кнопки перехода на 1-ю страницу
    let firstPageBtn = document.createElement("li");
    firstPageBtn.setAttribute("href", "#routes-table");
    firstPageBtn.classList.add("page-item");
    let firstPageLink = document.createElement("a");
    firstPageLink.classList.add("page-link");
    firstPageLink.setAttribute("href", "#routes-table");
    firstPageLink.innerHTML = "&laquo;&laquo;";
    firstPageBtn.appendChild(firstPageLink);
    if (currentPage == 1) {
        firstPageBtn.classList.add("disabled");
    } else {
        firstPageBtn.onclick = function () {
            paginationWorker(1);
        };
    }

    // создание кнопки перехода на последнюю страницу
    let lastPageBtn = document.createElement("li");
    lastPageBtn.setAttribute("href", "#routes-table");
    lastPageBtn.classList.add("page-item");
    let lastPageLink = document.createElement("a");
    lastPageLink.classList.add("page-link");
    lastPageLink.setAttribute("href", "#routes-table");
    lastPageLink.innerHTML = "&raquo;&raquo;";
    lastPageBtn.appendChild(lastPageLink);
    if (currentPage == maxPage) {
        lastPageBtn.classList.add("disabled");
    } else {
        lastPageBtn.onclick = function () {
            paginationWorker(maxPage);
        };
    }

    pgBtns.appendChild(firstPageBtn);

    // создание остальных кнопок страниц
    for (let i = start; i <= end; i++) {
        let pageItem = document.createElement("li");
        pageItem.setAttribute("href", "#routes-table");
        pageItem.classList.add("page-item");
        if (i == currentPage) {
            pageItem.classList.add("active");
        } else {
            pageItem.onclick = function () {
                paginationWorker(i);
            };
        }
        let pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.setAttribute("href", "#routes-table");
        pageLink.innerHTML = i;
        pageItem.appendChild(pageLink);
        pgBtns.appendChild(pageItem);
    }

    pgBtns.appendChild(lastPageBtn);

    displayRoutes();
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
        displayAlert(res.status, "error");
    }
};

function isDayOff(date) {
    let day = new Date(date);
    if (day.getDay() == 6 || day.getDay() == 7) {
        return true;
    }
    if (date >= "2024-01-01" && date <= "2024-01-08") {
        return true;
    }
    let daysOff = ["2024-02-23", "2024-03-08", "2024-04-29", "2024-04-30",
        "2024-05-01", "2024-05-09", "2024-05-10", "2024-06-12",
        "2024-10-04", "2024-12-30", "2024-12-31"];

    if (daysOff.includes(date)) {
        return true;
    }
    return false;
}

function priceCalculator() {
    let quickGuide = document.getElementById("quickGuide").checked;
    let sli = document.getElementById("sli").checked;
    let people = document.getElementById("excPeople").value;
    let duration = document.getElementById("excDuration").value;
    let date = document.getElementById("excDate").value;
    let time = document.getElementById("excTime").value;


    let curGuide; // гид экскурсии
    for (let guide of guidesList) {
        if (guide.id == currentGuide) {
            curGuide = guide;
        }
    }
    // Стоимость экскурсовода
    let price = curGuide.pricePerHour * duration;
    let priceIncrease = 1;

    // доп опция 1
    if (quickGuide) {
        priceIncrease += 0.3;
    }
    // доп опция 2
    if (sli) {
        if (people <= 5) {
            priceIncrease += 0.15;
        } else {
            priceIncrease += 0.25;
        }
    }
    // Если праздник или выходной
    if (isDayOff(date)) {
        priceIncrease += 0.5;
    }
    price *= priceIncrease;
    // если много посетителей
    if (people > 4 && people <= 10) {
        price += 1000;
    } else if (people > 10) {
        price += 1500;
    }
    // если утро
    if (time >= "09:00" && time <= "12:00") {
        price += 400;
    }
    // если вечер 
    if (time >= "20:00" && time <= "23:00") {
        price += 1000;
    }

    let priceDisplay = document.getElementById("totalPrice");
    priceDisplay.innerHTML = Math.round(price);
}

function checkOptions() {
    let sliCheck = document.getElementById("sli");
    let people = document.getElementById("excPeople").value;

    if (people > 10) {
        sliCheck.checked = false;
        sliCheck.disabled = true;
    } else {
        sliCheck.disabled = false;
    }
    priceCalculator();
}

async function orderExcursion() {
    let curGuide; // гид экскурсии
    for (let guide of guidesList) {
        if (guide.id == currentGuide) {
            curGuide = guide;
        }
    }
    document.querySelector("#guideName").innerHTML = curGuide.name;

    let curRoute; // маршрут экскурсии
    for (let route of routesList) {
        if (route.id == currentRoute) {
            curRoute = route;
        }
    }
    document.querySelector("#nameRoute").innerHTML = curRoute.name;

    let time = document.getElementById("excTime").value;
    let date = document.getElementById("excDate").value;
    let duration = document.getElementById("excDuration").value;
    let people = document.getElementById("excPeople").value;
    let price = document.getElementById("totalPrice").innerHTML;
    let quickGuide = document.getElementById("quickGuide").checked;
    let sli = document.getElementById("sli").checked;

    if (time != "" & date != "" & duration != "" & people != "") {
        let modal = document.getElementById("order-modal");
        let modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        let url = genURL("orders");
        let form = new FormData();
        form.append("guide_id", currentGuide);
        form.append("route_id", currentRoute);
        form.append("date", date);
        form.append("time", time);
        form.append("duration", duration);
        form.append("persons", people);
        form.append("price", price);
        form.append("optionFirst", Number(quickGuide));
        form.append("optionSecond", Number(sli));
        let response = await fetch(url, {
            method: "POST",
            body: form
        });
        if (response.ok) {
            displayAlert("Экскурсия успешно заказана");
        } else {
            displayAlert(response.status);
        }
    } else {
        displayAlert("Не все поля заполнены", "attention");
    }
}

function fillForm(event) {
    let curGuide; // гид экскурсии
    for (let guide of guidesList) {
        if (guide.id == currentGuide) {
            curGuide = guide;
        }
    }
    event.target.querySelector("#guideName").innerHTML = curGuide.name;

    let curRoute; // маршрут экскурсии
    for (let route of routesList) {
        if (route.id == currentRoute) {
            curRoute = route;
        }
    }
    event.target.querySelector("#nameRoute").innerHTML = curRoute.name;
    priceCalculator();
};

window.onload = async function () {
    let accountBtn = document.getElementById("accBtn");
    accountBtn.onclick = function () {
        window.location.href = "account.html";
    };

    messageBox = document.querySelector(".messageBox");

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
    };

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

    let orderModal = document.getElementById("order-modal");
    orderModal.addEventListener("show.bs.modal", fillForm);

    // Функционал полей формы оформления заявки
    document.getElementById("excDate").onchange = () => {
        priceCalculator();
    };
    document.getElementById("excTime").onchange = () => {
        priceCalculator();
    };
    document.getElementById("excDuration").onchange = () => {
        priceCalculator();
    };
    document.getElementById("excPeople").oninput = () => {
        checkOptions();
    };
    document.getElementById("quickGuide").onchange = () => {
        priceCalculator();
    };
    document.getElementById("sli").onchange = () => {
        priceCalculator();
    };
    document.getElementById("orderBtn").onclick = () => {
        orderExcursion();
    };
};