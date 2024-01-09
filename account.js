const server = "http://exam-2023-1-api.std-900.ist.mospolytech.ru";
const api = "c6ee856e-5b24-4d60-966a-4ed70a6a1134";

let orderList = []; // Список всех заявок
let currentOrder; // Текущая заявка
let currentGuide; // Гид текущей заявки
let currentRoute; // Маршрут текущей заявки
let currentPage = 1; // Текущая страница
let messageBox; // Для уведомлений (alert)

// Генерация URL
function genURL(path) {
    let url = new URL(`${server}/api/${path}`);
    url.searchParams.set("api_key", api);
    return url;
};

// Отображение уведомлений
function displayAlert(message, status="good") {
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

// Редактирование заявки на сервере
async function editExcursion() {
    document.querySelector("#guideName").innerHTML = currentGuide.name;
    document.querySelector("#nameRoute").innerHTML = currentRoute.name;

    let time = document.getElementById("excTime").value;
    let date = document.getElementById("excDate").value;
    let duration = document.getElementById("excDuration").value;
    let people = document.getElementById("excPeople").value;
    let price = document.getElementById("totalPrice").innerHTML;
    let quickGuide = document.getElementById("quickGuide").checked;
    let sli = document.getElementById("sli").checked;

    if (time != "" & date != "" & duration != "" & people != "") {
        let modal = document.getElementById("edit-modal");
        let modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        let url = genURL(`orders/${currentOrder.id}`);
        let form = new FormData();
        form.append("guide_id", currentGuide.id);
        form.append("route_id", currentRoute.id);
        form.append("date", date);
        form.append("time", time);
        form.append("duration", duration);
        form.append("persons", people);
        form.append("price", price);
        form.append("optionFirst", Number(quickGuide));
        form.append("optionSecond", Number(sli));
        let response = await fetch(url, {
            method: "PUT",
            body: form
        });
        if (response.ok) {
            displayAlert("Заявка успешно изменена");
        } else {
            displayAlert(response.status, "error");
        }
    } else {
        displayAlert("Не все поля заполнены", "attention");
    }
    orderList = await getOrders();
}

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
        displayAlert(res.status, "error");
    }
}

// Заполнение формы просмотра
async function fillViewForm(orderId) {
    let url = genURL(`orders/${orderId}`);
    let res = await fetch(url);

    if (!res.ok) {
        displayAlert(res.status, "error");
        return;
    } 
    let order = await res.json();

    let label = document.getElementById("viewLabel");
    label.innerHTML = `Заявка № ${order.id}`;

    let guideNameField = document.getElementById("guideNameView");
    let guide = await getGuide(order.guide_id);
    guideNameField.innerHTML = guide.name;

    let routeNameField = document.getElementById("nameRouteView");
    let route = await getRoute(order.route_id);
    routeNameField.innerHTML = route.name;

    let dateField = document.getElementById("excDateView");
    dateField.innerHTML = order.date;

    let timeField = document.getElementById("excTimeView");
    timeField.innerHTML = order.time;

    let durationField = document.getElementById("excDurationView");
    if (order.duration == 1) {
        durationField.innerHTML = "1 час";
    } else {
        durationField.innerHTML = `${order.duration} часа`;
    }

    let peopleField = document.getElementById("excPeopleView");
    peopleField.innerHTML = order.persons;

    let priceField = document.getElementById("totalPriceView");
    priceField.innerHTML = order.price;

    let quickGuide = document.getElementById("quickGuideView");
    if (!order.optionFirst) {
        quickGuide.classList.add("hidden");
    } else {
        quickGuide.classList.remove("hidden");
    }

    let quickGuideField = document.getElementById("quickGuidePriceView");
    let quickGuidePrice = guide.pricePerHour * order.duration * 0.3;
    quickGuideField.innerHTML = `${Math.floor(quickGuidePrice)} &#8381; (30%)`;

    let sli = document.getElementById("sliDivView")
    if (!order.optionSecond) {
        sli.classList.add("hidden");
    } else {
        sli.classList.remove("hidden");
    }
    let sliField = document.getElementById("sliPriceView");
    let sliPercent = order.persons > 10 ? 25 : 15;
    let sliPrice = guide.pricePerHour * order.duration * (sliPercent / 100);
    sliField.innerHTML = `${Math.floor(sliPrice)} &#8381; (${sliPercent}%)`;
};

// Проверка является ли день выходным
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

// Расчёт стоимости заявки
async function priceCalculator(order) {
    let quickGuide = document.getElementById("quickGuide").checked;
    let sli = document.getElementById("sli").checked;
    let people = document.getElementById("excPeople").value;
    let duration = document.getElementById("excDuration").value;
    let date = document.getElementById("excDate").value;
    let time = document.getElementById("excTime").value;

    // Получение экскурсовода выбранной экскурсии
    let curGuide = currentGuide;

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
    price *= priceIncrease
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

// Проверка опций заявки
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

// Заполнение формы редактирования
async function fillEditForm(orderId) {
    let url = genURL(`orders/${orderId}`);
    let res = await fetch(url);

    if (!res.ok) {
        displayAlert(res.status, "error");
        return;
    }
    let order = await res.json();

    let label = document.getElementById("editLabel");
    label.innerHTML = `Редактирование заявки № ${order.id}`;

    let guideNameField = document.getElementById("guideName");
    let guide = await getGuide(order.guide_id);
    guideNameField.innerHTML = guide.name;

    let routeNameField = document.getElementById("nameRoute");
    let route = await getRoute(order.route_id);
    routeNameField.innerHTML = route.name;

    let dateField = document.getElementById("excDate");
    dateField.value = order.date;

    let timeField = document.getElementById("excTime");
    timeField.value = order.time;

    let duratSelect = document.getElementById("excDuration");
    duratSelect.selectedIndex = order.duration - 1;

    let peopleField = document.getElementById("excPeople");
    peopleField.value = order.persons;

    let priceField = document.getElementById("totalPrice");
    priceField.innerHTML = order.price;

    let quickGuide = document.getElementById("quickGuide");
    quickGuide.checked = order.optionFirst;

    let sli = document.getElementById("sli");
    sli.checked = order.optionSecond;

    checkOptions();
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

        viewBtn.classList.add("bi", "bi-eye", "px-1");
        viewBtn.setAttribute("data-bs-toggle", "modal");
        viewBtn.setAttribute("data-bs-target", "#view-modal");
        viewBtn.onclick = function () {
            fillViewForm(order.id);
        }

        let editBtn = document.createElement("i");
        editBtn.classList.add("bi", "bi-pencil", "px-1");
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#edit-modal");
        editBtn.onclick = async function () {
            currentOrder = order;
            currentRoute = await getRoute(order.route_id);
            currentGuide = await getGuide(order.guide_id);
            fillEditForm(order.id);
        }

        let delBtn = document.createElement("i");
        delBtn.classList.add("bi", "bi-trash", "px-1");
        delBtn.setAttribute("data-bs-toggle", "modal");
        delBtn.setAttribute("data-bs-target", "#delete-modal");
        delBtn.onclick = function () {
            let confButton = document.getElementById("delConfirm");
            confButton.setAttribute("orderId", order.id);
        };

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

// Работа с пагинацией
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
        displayAlert(res.status, "error");
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
        displayAlert(res.status, "error");
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
        displayAlert(res.status, "error");
    }
};

window.onload = async function () {
    let homeBtn = document.getElementById("homeBtn");
    homeBtn.onclick = function () {
        window.location.href = "index.html";
    };

    messageBox = document.querySelector(".messageBox");

    orderList = await getOrders();
    paginationWorker(1);
};