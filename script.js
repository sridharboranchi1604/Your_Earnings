// ============================================================
// FIREBASE IMPORTS
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBceA9YFgQL-Ddq5_OdW1x6upz0nrE8Z2I",
    authDomain: "daily-numbers-fc844.firebaseapp.com",
    databaseURL: "https://daily-numbers-fc844-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "daily-numbers-fc844",
    storageBucket: "daily-numbers-fc844.firebasestorage.app",
    messagingSenderId: "784331875574",
    appId: "1:784331875574:web:ae0fe894576f60b75f38d7",
    measurementId: "G-16W0L37V2V"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = getAuth(app);

const investmentsRef =
    ref(database, "investments");


// ============================================================
// CONSTANTS
// ============================================================

const PRINCIPAL = 100000;

let lastSyncTimestamp = null;
let lastSyncInterval = null;


// ============================================================
// EXACT DATE + TIME
// ============================================================

function formatExactDateTime(timestamp) {

    if (
        timestamp === null ||
        timestamp === undefined ||
        timestamp === ""
    ) {
        return "—";
    }

    const numericTimestamp =
        Number(timestamp);

    if (
        !Number.isFinite(numericTimestamp) ||
        numericTimestamp <= 0
    ) {
        return "—";
    }

    const date =
        new Date(numericTimestamp);

    if (isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );

}


// ============================================================
// TIME AGO
// ============================================================

function formatTimeAgo(timestamp) {

    if (
        timestamp === null ||
        timestamp === undefined ||
        timestamp === ""
    ) {
        return "—";
    }

    const numericTimestamp =
        Number(timestamp);

    if (
        !Number.isFinite(numericTimestamp) ||
        numericTimestamp <= 0
    ) {
        return "—";
    }

    const now =
        Date.now();

    let difference =
        Math.floor(
            (now - numericTimestamp) / 1000
        );

    if (difference < 0) {
        difference = 0;
    }


    // Less than 10 seconds
    if (difference < 10) {

        return "Updated just now";

    }


    // Seconds
    if (difference < 60) {

        return `Updated ${difference} seconds ago`;

    }


    const minutes =
        Math.floor(
            difference / 60
        );


    // Minutes
    if (minutes < 60) {

        return (
            `Updated ${minutes} ` +
            `${minutes === 1 ? "minute" : "minutes"} ago`
        );

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    // Hours
    if (hours < 24) {

        return (
            `Updated ${hours} ` +
            `${hours === 1 ? "hour" : "hours"} ago`
        );

    }


    const days =
        Math.floor(
            hours / 24
        );


    // Days
    return (
        `Updated ${days} ` +
        `${days === 1 ? "day" : "days"} ago`
    );

}


// ============================================================
// LAST SYNC DISPLAY
// ============================================================

function updateLastSyncDisplay(timestamp) {

    const relativeElement =
        document.getElementById(
            "snapshot-last-sync"
        );

    const exactElement =
        document.getElementById(
            "snapshot-last-sync-exact"
        );


    if (
        !relativeElement ||
        !exactElement
    ) {
        return;
    }


    // --------------------------------------------------------
    // No timestamp
    // --------------------------------------------------------

    if (
        timestamp === null ||
        timestamp === undefined ||
        timestamp === ""
    ) {

        relativeElement.textContent =
            "—";

        exactElement.textContent =
            "No sync time available";

        lastSyncTimestamp = null;

        if (lastSyncInterval) {

            clearInterval(
                lastSyncInterval
            );

            lastSyncInterval = null;

        }

        return;

    }


    const numericTimestamp =
        Number(timestamp);


    // --------------------------------------------------------
    // Invalid timestamp
    // --------------------------------------------------------

    if (
        !Number.isFinite(numericTimestamp) ||
        numericTimestamp <= 0
    ) {

        relativeElement.textContent =
            "—";

        exactElement.textContent =
            "No sync time available";

        lastSyncTimestamp = null;

        if (lastSyncInterval) {

            clearInterval(
                lastSyncInterval
            );

            lastSyncInterval = null;

        }

        return;

    }


    const date =
        new Date(numericTimestamp);


    if (isNaN(date.getTime())) {

        relativeElement.textContent =
            "—";

        exactElement.textContent =
            "No sync time available";

        lastSyncTimestamp = null;

        return;

    }


    // --------------------------------------------------------
    // Store timestamp
    // --------------------------------------------------------

    lastSyncTimestamp =
        numericTimestamp;


    // --------------------------------------------------------
    // Initial display
    // --------------------------------------------------------

    relativeElement.textContent =
        formatTimeAgo(
            lastSyncTimestamp
        );

    exactElement.textContent =
        formatExactDateTime(
            lastSyncTimestamp
        );


    // --------------------------------------------------------
    // Clear previous interval
    // --------------------------------------------------------

    if (lastSyncInterval) {

        clearInterval(
            lastSyncInterval
        );

    }


    // --------------------------------------------------------
    // Update every 30 seconds
    // --------------------------------------------------------

    lastSyncInterval =
        setInterval(
            () => {

                if (!lastSyncTimestamp) {
                    return;
                }

                relativeElement.textContent =
                    formatTimeAgo(
                        lastSyncTimestamp
                    );

            },
            30000
        );

}


// ============================================================
// DOM ELEMENTS
// ============================================================

const lastUpdated =
    document.getElementById(
        "last-updated"
    );


// ============================================================
// PINTU
// ============================================================

const pintuValue =
    document.getElementById(
        "pintu-value"
    );

const pintuProfit =
    document.getElementById(
        "pintu-profit"
    );

const pintuReturn =
    document.getElementById(
        "pintu-return"
    );

const pintuDaily =
    document.getElementById(
        "pintu-daily"
    );

const todayPintu =
    document.getElementById(
        "today-pintu"
    );


// ============================================================
// AKSHAY
// ============================================================

const akshayValue =
    document.getElementById(
        "akshay-value"
    );

const akshayProfit =
    document.getElementById(
        "akshay-profit"
    );

const akshayReturn =
    document.getElementById(
        "akshay-return"
    );

const akshayDaily =
    document.getElementById(
        "akshay-daily"
    );

const todayAkshay =
    document.getElementById(
        "today-akshay"
    );


// ============================================================
// RAJU
// ============================================================

const rajuValue =
    document.getElementById(
        "raju-value"
    );

const rajuProfit =
    document.getElementById(
        "raju-profit"
    );

const rajuReturn =
    document.getElementById(
        "raju-return"
    );

const rajuDaily =
    document.getElementById(
        "raju-daily"
    );

const todayRaju =
    document.getElementById(
        "today-raju"
    );


// ============================================================
// HISTORY
// ============================================================

const historyBody =
    document.getElementById(
        "history-body"
    );


// ============================================================
// CHART
// ============================================================

const chartCanvas =
    document.getElementById(
        "growthChart"
    );


// ============================================================
// LOGIN
// ============================================================

const loginSection =
    document.getElementById(
        "login-section"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginButton =
    document.getElementById(
        "login-btn"
    );

const loginMessage =
    document.getElementById(
        "login-message"
    );


// ============================================================
// ADMIN
// ============================================================

const adminPanel =
    document.getElementById(
        "admin-panel"
    );

const logoutButton =
    document.getElementById(
        "logout-btn"
    );

const pintuInput =
    document.getElementById(
        "pintu-input"
    );

const akshayInput =
    document.getElementById(
        "akshay-input"
    );

const rajuInput =
    document.getElementById(
        "raju-input"
    );

const updateButton =
    document.getElementById(
        "update-btn"
    );

const updateMessage =
    document.getElementById(
        "update-message"
    );


// ============================================================
// SNAPSHOT
// ============================================================

const topPerformer =
    document.getElementById(
        "top-performer"
    );

const topPerformerValue =
    document.getElementById(
        "top-performer-value"
    );

const marketMovement =
    document.getElementById(
        "market-movement"
    );

const marketMovementSub =
    document.getElementById(
        "market-movement-sub"
    );


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentData = null;

let growthChart = null;


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(value) || 0
    );

}


// ============================================================
// PERCENTAGE
// ============================================================

function formatPercentage(value) {

    return (
        `${(
            Number(value) || 0
        ).toFixed(2)}%`
    );

}


// ============================================================
// TODAY
// ============================================================

function getTodayDate() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        isNaN(
            date.getTime()
        )
    ) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// DATE + TIME
// ============================================================

function formatDateTime(timestamp) {

    return formatExactDateTime(
        timestamp
    );

}


// ============================================================
// NUMBER ANIMATION
// ============================================================

function animateNumber(
    element,
    targetValue,
    duration = 1400
) {

    if (!element) {
        return;
    }

    const target =
        Number(targetValue) || 0;


    if (element._animationFrame) {

        cancelAnimationFrame(
            element._animationFrame
        );

    }


    const startValue = 0;

    const startTime =
        performance.now();


    function animate(
        currentTime
    ) {

        const elapsed =
            currentTime -
            startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        const easedProgress =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        const currentValue =
            startValue +
            (
                target -
                startValue
            ) *
            easedProgress;


        element.textContent =
            formatCurrency(
                currentValue
            );


        if (progress < 1) {

            element._animationFrame =
                requestAnimationFrame(
                    animate
                );

        }
        else {

            element.textContent =
                formatCurrency(
                    target
                );

            element._animationFrame =
                null;

        }

    }


    element.textContent =
        formatCurrency(0);


    element._animationFrame =
        requestAnimationFrame(
            animate
        );

}


// ============================================================
// HOLDING DISPLAY
// ============================================================

function updateHoldingDisplay(
    element,
    value
) {

    animateNumber(
        element,
        value,
        1500
    );

}


// ============================================================
// GET HOLDING
// ============================================================

function getHolding(
    data,
    person
) {

    if (!data) {
        return 0;
    }

    return Number(
        data[person]
    ) || 0;

}


// ============================================================
// VALID HISTORY DATE
// ============================================================

function isValidHistoryDate(
    date
) {

    return /^\d{4}-\d{2}-\d{2}$/.test(
        date
    );

}


// ============================================================
// GET HISTORY DATES
// ============================================================

function getHistoryDates(
    history
) {

    if (!history) {
        return [];
    }

    return Object.keys(history)
        .filter(
            isValidHistoryDate
        )
        .sort();

}


// ============================================================
// LATEST HISTORY DATE
// ============================================================

function getLatestHistoryDate(
    history
) {

    const dates =
        getHistoryDates(
            history
        );

    if (!dates.length) {
        return null;
    }

    return dates[
        dates.length - 1
    ];

}


// ============================================================
// PREVIOUS HOLDING
// ============================================================

function getPreviousValue(
    history,
    currentDate,
    person
) {

    const dates =
        getHistoryDates(
            history
        );

    const currentIndex =
        dates.indexOf(
            currentDate
        );


    if (currentIndex <= 0) {
        return null;
    }


    const previousDate =
        dates[
            currentIndex - 1
        ];


    const previousRecord =
        history[
            previousDate
        ];


    if (
        !previousRecord ||
        previousRecord[person] === undefined
    ) {

        return null;

    }


    return Number(
        previousRecord[person]
    );

}


// ============================================================
// DAILY CHANGE
// ============================================================

function setDailyChange(
    element,
    change
) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "positive",
        "negative",
        "change-positive",
        "change-negative"
    );


    change =
        Number(change) || 0;


    if (change > 0) {

        element.textContent =
            `+${formatCurrency(change)}`;

        element.classList.add(
            "positive",
            "change-positive"
        );

    }
    else if (change < 0) {

        element.textContent =
            formatCurrency(change);

        element.classList.add(
            "negative",
            "change-negative"
        );

    }
    else {

        element.textContent =
            "₹0.00";

    }

}


// ============================================================
// UPDATE PERSON CARD
// ============================================================

function updatePersonCard(
    person,
    holding,
    previousHolding
) {

    holding =
        Number(holding) || 0;


    // Current holding already includes ₹1,00,000 principal.
    const profit =
        holding -
        PRINCIPAL;


    const returnPercentage =
        (
            profit /
            PRINCIPAL
        ) *
        100;


    let dailyChange = 0;


    if (
        previousHolding !== null &&
        previousHolding !== undefined
    ) {

        dailyChange =
            holding -
            Number(previousHolding);

    }


    // --------------------------------------------------------
    // PINTU
    // --------------------------------------------------------

    if (person === "person1") {

        updateHoldingDisplay(
            pintuValue,
            holding
        );


        if (pintuProfit) {

            pintuProfit.textContent =
                formatCurrency(
                    profit
                );

            pintuProfit.classList.toggle(
                "positive",
                profit >= 0
            );

            pintuProfit.classList.toggle(
                "negative",
                profit < 0
            );

        }


        if (pintuReturn) {

            pintuReturn.textContent =
                formatPercentage(
                    returnPercentage
                );

        }


        setDailyChange(
            pintuDaily,
            dailyChange
        );


        if (todayPintu) {

            updateHoldingDisplay(
                todayPintu,
                holding
            );

        }

    }


    // --------------------------------------------------------
    // AKSHAY
    // --------------------------------------------------------

    if (person === "person2") {

        updateHoldingDisplay(
            akshayValue,
            holding
        );


        if (akshayProfit) {

            akshayProfit.textContent =
                formatCurrency(
                    profit
                );

            akshayProfit.classList.toggle(
                "positive",
                profit >= 0
            );

            akshayProfit.classList.toggle(
                "negative",
                profit < 0
            );

        }


        if (akshayReturn) {

            akshayReturn.textContent =
                formatPercentage(
                    returnPercentage
                );

        }


        setDailyChange(
            akshayDaily,
            dailyChange
        );


        if (todayAkshay) {

            updateHoldingDisplay(
                todayAkshay,
                holding
            );

        }

    }


    // --------------------------------------------------------
    // RAJU
    // --------------------------------------------------------

    if (person === "person3") {

        updateHoldingDisplay(
            rajuValue,
            holding
        );


        if (rajuProfit) {

            rajuProfit.textContent =
                formatCurrency(
                    profit
                );

            rajuProfit.classList.toggle(
                "positive",
                profit >= 0
            );

            rajuProfit.classList.toggle(
                "negative",
                profit < 0
            );

        }


        if (rajuReturn) {

            rajuReturn.textContent =
                formatPercentage(
                    returnPercentage
                );

        }


        setDailyChange(
            rajuDaily,
            dailyChange
        );


        if (todayRaju) {

            updateHoldingDisplay(
                todayRaju,
                holding
            );

        }

    }

}


// ============================================================
// MAIN DISPLAY
// ============================================================

function updateMainDisplay(
    data
) {

    if (!data) {
        return;
    }


    const pintuHolding =
        getHolding(
            data,
            "person1"
        );

    const akshayHolding =
        getHolding(
            data,
            "person2"
        );

    const rajuHolding =
        getHolding(
            data,
            "person3"
        );


    const history =
        data.history || {};


    const latestDate =
        getLatestHistoryDate(
            history
        );


    let pintuPrevious = null;
    let akshayPrevious = null;
    let rajuPrevious = null;


    if (latestDate) {

        pintuPrevious =
            getPreviousValue(
                history,
                latestDate,
                "person1"
            );

        akshayPrevious =
            getPreviousValue(
                history,
                latestDate,
                "person2"
            );

        rajuPrevious =
            getPreviousValue(
                history,
                latestDate,
                "person3"
            );

    }


    updatePersonCard(
        "person1",
        pintuHolding,
        pintuPrevious
    );

    updatePersonCard(
        "person2",
        akshayHolding,
        akshayPrevious
    );

    updatePersonCard(
        "person3",
        rajuHolding,
        rajuPrevious
    );


    // --------------------------------------------------------
    // EXACT LAST UPDATED
    // --------------------------------------------------------

    let timestamp = null;


    if (
        latestDate &&
        history[latestDate]?.updatedAt
    ) {

        timestamp =
            history[latestDate].updatedAt;

    }


    if (
        !timestamp &&
        data.lastUpdatedAt
    ) {

        timestamp =
            data.lastUpdatedAt;

    }


    if (lastUpdated) {

        if (timestamp) {

            lastUpdated.textContent =
                `Last updated: ${formatDateTime(timestamp)}`;

        }
        else if (latestDate) {

            lastUpdated.textContent =
                `Last updated: ${formatDate(latestDate)}`;

        }
        else {

            lastUpdated.textContent =
                "Waiting for latest update...";

        }

    }


    // --------------------------------------------------------
    // SNAPSHOT
    // --------------------------------------------------------

    updateSnapshot(
        data
    );

}


// ============================================================
// SNAPSHOT
// ============================================================

function updateSnapshot(
    data
) {

    if (!data) {
        return;
    }


    const people = [

        {
            name: "Pintu",
            person: "person1",
            holding:
                getHolding(
                    data,
                    "person1"
                )
        },

        {
            name: "Akshay",
            person: "person2",
            holding:
                getHolding(
                    data,
                    "person2"
                )
        },

        {
            name: "Raju",
            person: "person3",
            holding:
                getHolding(
                    data,
                    "person3"
                )
        }

    ];


    // --------------------------------------------------------
    // TOP PERFORMER
    // --------------------------------------------------------

    people.forEach(
        person => {

            person.profit =
                person.holding -
                PRINCIPAL;

            person.return =
                (
                    person.profit /
                    PRINCIPAL
                ) *
                100;

        }
    );


    people.sort(
        (a, b) =>
            b.return -
            a.return
    );


    const best =
        people[0];


    if (
        topPerformer &&
        best
    ) {

        topPerformer.textContent =
            best.name;

    }


    if (
        topPerformerValue &&
        best
    ) {

        topPerformerValue.textContent =
            `${formatPercentage(best.return)} return`;

    }


    // --------------------------------------------------------
    // DAILY MARKET MOVEMENT
    // --------------------------------------------------------

    const history =
        data.history || {};


    const latestDate =
        getLatestHistoryDate(
            history
        );


    let up = 0;
    let down = 0;
    let unchanged = 0;


    if (latestDate) {

        people.forEach(
            person => {

                const previous =
                    getPreviousValue(
                        history,
                        latestDate,
                        person.person
                    );


                if (
                    previous === null
                ) {

                    return;

                }


                const change =
                    person.holding -
                    previous;


                if (change > 0) {

                    up++;

                }
                else if (change < 0) {

                    down++;

                }
                else {

                    unchanged++;

                }

            }
        );

    }


    if (marketMovement) {

        if (
            up > 0 &&
            down === 0
        ) {

            marketMovement.textContent =
                "Positive";

            marketMovement.className =
                "positive";

        }
        else if (
            down > 0 &&
            up === 0
        ) {

            marketMovement.textContent =
                "Negative";

            marketMovement.className =
                "negative";

        }
        else if (
            up === 0 &&
            down === 0
        ) {

            marketMovement.textContent =
                "No change";

            marketMovement.className =
                "";

        }
        else {

            marketMovement.textContent =
                "Mixed";

            marketMovement.className =
                "";

        }

    }


    if (marketMovementSub) {

        marketMovementSub.textContent =
            `${up} up • ${down} down • ${unchanged} unchanged`;

    }


    // --------------------------------------------------------
    // SNAPSHOT LAST SYNC
    // --------------------------------------------------------

    let timestamp = null;


    if (
        latestDate &&
        history[latestDate]?.updatedAt
    ) {

        timestamp =
            history[latestDate].updatedAt;

    }


    if (
        !timestamp &&
        data.lastUpdatedAt
    ) {

        timestamp =
            data.lastUpdatedAt;

    }


    // IMPORTANT:
    // This now controls:
    //
    // Updated 2 minutes ago
    //
    // 16 Aug 2026, 07:42:18 PM
    //
    updateLastSyncDisplay(
        timestamp
    );

}


// ============================================================
// HISTORY TABLE
// ============================================================

function buildHistory(
    data
) {

    if (!historyBody) {
        return;
    }


    historyBody.innerHTML = "";


    const originalHistory =
        data?.history || {};


    const history = {
        ...originalHistory
    };


    let dates =
        getHistoryDates(
            history
        ).reverse();


    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    if (
        dates.length === 0 &&
        (
            data.person1 !== undefined ||
            data.person2 !== undefined ||
            data.person3 !== undefined
        )
    ) {

        const today =
            getTodayDate();


        dates = [today];


        history[today] = {

            person1:
                Number(
                    data.person1
                ) || 0,

            person2:
                Number(
                    data.person2
                ) || 0,

            person3:
                Number(
                    data.person3
                ) || 0

        };

    }


    if (!dates.length) {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML =
            `<td colspan="4">No history available</td>`;


        historyBody.appendChild(
            row
        );


        return;

    }


    const chronologicalDates =
        [...dates].sort();


    dates.forEach(
        date => {

            const row =
                document.createElement(
                    "tr"
                );


            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                formatDate(
                    date
                );


            row.appendChild(
                dateCell
            );


            createHistoryCell(
                row,
                history,
                chronologicalDates,
                date,
                "person1"
            );


            createHistoryCell(
                row,
                history,
                chronologicalDates,
                date,
                "person2"
            );


            createHistoryCell(
                row,
                history,
                chronologicalDates,
                date,
                "person3"
            );


            historyBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// HISTORY CELL
// ============================================================

function createHistoryCell(
    row,
    history,
    dates,
    date,
    person
) {

    const cell =
        document.createElement(
            "td"
        );


    const record =
        history[date] || {};


    const holding =
        Number(
            record[person]
        ) || 0;


    const value =
        document.createElement(
            "div"
        );


    value.className =
        "history-value";


    value.textContent =
        formatCurrency(
            holding
        );


    cell.appendChild(
        value
    );


    const currentIndex =
        dates.indexOf(
            date
        );


    // --------------------------------------------------------
    // FIRST DAY = HOLDING ONLY
    // --------------------------------------------------------

    if (currentIndex === 0) {

        row.appendChild(
            cell
        );

        return;

    }


    const previousDate =
        dates[
            currentIndex - 1
        ];


    const previousRecord =
        history[
            previousDate
        ] || {};


    const previousHolding =
        Number(
            previousRecord[person]
        ) || 0;


    const change =
        holding -
        previousHolding;


    const changeElement =
        document.createElement(
            "div"
        );


    changeElement.className =
        "history-change";


    if (change > 0) {

        changeElement.textContent =
            `+${formatCurrency(change)}`;

        changeElement.classList.add(
            "positive",
            "change-positive"
        );

    }
    else if (change < 0) {

        changeElement.textContent =
            formatCurrency(change);

        changeElement.classList.add(
            "negative",
            "change-negative"
        );

    }
    else {

        changeElement.textContent =
            "₹0.00";

    }


    cell.appendChild(
        changeElement
    );


    row.appendChild(
        cell
    );

}


// ============================================================
// CHART
// ============================================================

function buildChart(
    data
) {

    if (!chartCanvas) {
        return;
    }


    const history =
        data?.history || {};


    const dates =
        getHistoryDates(
            history
        );


    if (!dates.length) {

        if (growthChart) {

            growthChart.destroy();

            growthChart = null;

        }

        return;

    }


    const labels =
        dates.map(
            date =>
                formatDate(
                    date
                )
        );


    const pintuData =
        dates.map(
            date =>
                Number(
                    history[date]?.person1
                ) || 0
        );


    const akshayData =
        dates.map(
            date =>
                Number(
                    history[date]?.person2
                ) || 0
        );


    const rajuData =
        dates.map(
            date =>
                Number(
                    history[date]?.person3
                ) || 0
        );


    if (growthChart) {

        growthChart.destroy();

    }


    const ctx =
        chartCanvas.getContext(
            "2d"
        );


    growthChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Pintu",
                            data: pintuData,
                            tension: 0.35,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            fill: false
                        },

                        {
                            label: "Akshay",
                            data: akshayData,
                            tension: 0.35,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            fill: false
                        },

                        {
                            label: "Raju",
                            data: rajuData,
                            tension: 0.35,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            fill: false
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    animation: {

                        duration: 1200,

                        easing:
                            "easeOutQuart"

                    },


                    interaction: {

                        mode: "index",

                        intersect: false

                    },


                    plugins: {

                        legend: {

                            display: true,

                            labels: {

                                usePointStyle: true,

                                boxWidth: 7,

                                padding: 18

                            }

                        },


                        tooltip: {

                            backgroundColor:
                                "rgba(7,10,16,0.96)",

                            borderColor:
                                "rgba(255,255,255,0.08)",

                            borderWidth: 1,

                            padding: 12,


                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        return (
                                            `${context.dataset.label}: ` +
                                            formatCurrency(
                                                context.parsed.y
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {
                                color: "#7d8796"
                            }

                        },


                        y: {

                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"

                            },


                            ticks: {

                                color:
                                    "#7d8796",


                                callback:
                                    function(
                                        value
                                    ) {

                                        return formatCurrency(
                                            value
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// FIREBASE REALTIME LISTENER
// ============================================================

onValue(
    investmentsRef,

    snapshot => {

        const data =
            snapshot.val();


        if (!data) {
            return;
        }


        currentData =
            data;


        updateMainDisplay(
            data
        );


        buildHistory(
            data
        );


        buildChart(
            data
        );


        updateAdminTodayStatus(
            data
        );

    },


    error => {

        console.error(
            "Firebase error:",
            error
        );

    }
);


// ============================================================
// LOGIN
// ============================================================

if (loginButton) {

    loginButton.addEventListener(
        "click",

        async () => {

            const email =
                emailInput?.value.trim();

            const password =
                passwordInput?.value;


            if (
                !email ||
                !password
            ) {

                if (loginMessage) {

                    loginMessage.textContent =
                        "Please enter email and password.";

                }

                return;

            }


            if (loginMessage) {

                loginMessage.textContent =
                    "Signing in...";

            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        "Login successful.";

                }

            }
            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        "Invalid email or password.";

                }

            }

        }
    );

}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,

    user => {

        if (user) {

            if (loginSection) {

                loginSection.classList.add(
                    "hidden"
                );

            }


            if (adminPanel) {

                adminPanel.classList.remove(
                    "hidden"
                );

            }

        }
        else {

            if (loginSection) {

                loginSection.classList.remove(
                    "hidden"
                );

            }


            if (adminPanel) {

                adminPanel.classList.add(
                    "hidden"
                );

            }

        }

    }
);


// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",

        async () => {

            try {

                await signOut(
                    auth
                );

            }
            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


// ============================================================
// INPUT VALIDATION
// ============================================================

function validateInput(
    input,
    name
) {

    if (!input) {

        return {

            valid: false,

            message:
                `${name} input not found.`

        };

    }


    if (
        input.value.trim() === ""
    ) {

        return {

            valid: false,

            message:
                `Please enter ${name}'s current holding.`

        };

    }


    const value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return {

            valid: false,

            message:
                `Please enter a valid value for ${name}.`

        };

    }


    return {

        valid: true,

        value

    };

}


// ============================================================
// UPDATE TODAY
// ============================================================

async function updateToday() {

    if (!auth.currentUser) {

        if (updateMessage) {

            updateMessage.textContent =
                "Please login first.";

        }

        return;

    }


    // --------------------------------------------------------
    // VALIDATE INPUTS
    // --------------------------------------------------------

    const pintu =
        validateInput(
            pintuInput,
            "Pintu"
        );


    const akshay =
        validateInput(
            akshayInput,
            "Akshay"
        );


    const raju =
        validateInput(
            rajuInput,
            "Raju"
        );


    if (!pintu.valid) {

        if (updateMessage) {

            updateMessage.textContent =
                pintu.message;

        }

        return;

    }


    if (!akshay.valid) {

        if (updateMessage) {

            updateMessage.textContent =
                akshay.message;

        }

        return;

    }


    if (!raju.valid) {

        if (updateMessage) {

            updateMessage.textContent =
                raju.message;

        }

        return;

    }


    const today =
        getTodayDate();


    if (updateMessage) {

        updateMessage.textContent =
            "Updating portfolio...";

    }


    if (updateButton) {

        updateButton.disabled =
            true;

    }


    try {

        const result =
            await runTransaction(
                investmentsRef,

                current => {

                    if (!current) {

                        current = {};

                    }


                    if (!current.history) {

                        current.history = {};

                    }


                    // ------------------------------------------------
                    // PREVENT DUPLICATE UPDATE
                    // ------------------------------------------------

                    if (
                        current.history[today]
                    ) {

                        return;

                    }


                    const timestamp =
                        Date.now();


                    // ------------------------------------------------
                    // CURRENT HOLDINGS
                    //
                    // These values already INCLUDE
                    // the ₹1,00,000 principal.
                    // ------------------------------------------------

                    current.person1 =
                        pintu.value;

                    current.person2 =
                        akshay.value;

                    current.person3 =
                        raju.value;


                    // ------------------------------------------------
                    // HISTORY
                    // ------------------------------------------------

                    current.history[today] = {

                        person1:
                            pintu.value,

                        person2:
                            akshay.value,

                        person3:
                            raju.value,

                        updatedAt:
                            timestamp

                    };


                    // ------------------------------------------------
                    // LAST UPDATED
                    // ------------------------------------------------

                    current.lastUpdated =
                        today;

                    current.lastUpdatedAt =
                        timestamp;


                    return current;

                }
            );


        // --------------------------------------------------------
        // TRANSACTION FAILED / ALREADY UPDATED
        // --------------------------------------------------------

        if (!result.committed) {

            if (updateMessage) {

                updateMessage.textContent =
                    "Today's values have already been updated.";

            }


            // Refresh status using latest transaction snapshot
            if (result.snapshot) {

                currentData =
                    result.snapshot.val();

                updateAdminTodayStatus(
                    currentData
                );

            }

            return;

        }


        // --------------------------------------------------------
        // IMPORTANT FIX
        //
        // Use the newly committed Firebase snapshot immediately.
        // --------------------------------------------------------

        if (result.snapshot) {

            currentData =
                result.snapshot.val();

        }


        if (updateMessage) {

            updateMessage.textContent =
                "✓ Today's portfolio values updated successfully.";

        }


        // --------------------------------------------------------
        // CLEAR INPUTS
        // --------------------------------------------------------

        if (pintuInput) {

            pintuInput.value =
                "";

        }


        if (akshayInput) {

            akshayInput.value =
                "";

        }


        if (rajuInput) {

            rajuInput.value =
                "";

        }


        // --------------------------------------------------------
        // UPDATE ADMIN STATUS IMMEDIATELY
        // --------------------------------------------------------

        updateAdminTodayStatus(
            currentData
        );


        // --------------------------------------------------------
        // UPDATE LAST SYNC IMMEDIATELY
        // --------------------------------------------------------

        if (
            currentData &&
            currentData.lastUpdatedAt
        ) {

            updateLastSyncDisplay(
                currentData.lastUpdatedAt
            );

        }

    }
    catch (error) {

        console.error(
            "Update error:",
            error
        );


        if (updateMessage) {

            updateMessage.textContent =
                "Update failed. Please try again.";

        }


        // Re-check current Firebase data
        if (currentData) {

            updateAdminTodayStatus(
                currentData
            );

        }

    }
    finally {

        // Do not blindly enable the button.
        // Firebase data decides whether today is already updated.

        if (currentData) {

            updateAdminTodayStatus(
                currentData
            );

        }

    }

}


// ============================================================
// UPDATE BUTTON
// ============================================================

if (updateButton) {

    updateButton.addEventListener(
        "click",
        updateToday
    );

}


// ============================================================
// ADMIN TODAY STATUS
// ============================================================

function updateAdminTodayStatus(
    data
) {

    if (!data) {
        return;
    }


    const today =
        getTodayDate();


    const alreadyUpdated =
        Boolean(
            data.history &&
            data.history[today]
        );


    if (updateButton) {

        updateButton.disabled =
            alreadyUpdated;

    }


    const alreadyUpdatedElement =
        document.getElementById(
            "alreadyUpdated"
        );


    if (alreadyUpdatedElement) {

        if (alreadyUpdated) {

            alreadyUpdatedElement.classList.remove(
                "hidden"
            );


            alreadyUpdatedElement.textContent =
                "Today's values have already been updated.";

        }
        else {

            alreadyUpdatedElement.classList.add(
                "hidden"
            );

        }

    }

}


// ============================================================
// ENTER KEY LOGIN
// ============================================================

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",

        event => {

            if (
                event.key === "Enter"
            ) {

                loginButton?.click();

            }

        }
    );

}


// ============================================================
// START
// ============================================================

console.log(
    "Investment dashboard loaded successfully."
);