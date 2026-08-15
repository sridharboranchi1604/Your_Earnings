import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

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


// ==========================================
// FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = getAuth(app);

const numbersRef = ref(database, "numbers");


// ==========================================
// PEOPLE
// ==========================================

const people = [
    {
        name: "Pintu",
        valueId: "value1",
        inputId: "input1",
        labelId: "label1",
        todayValueId: "todayValue1",
        todayNameId: "todayName1"
    },

    {
        name: "Akshay",
        valueId: "value2",
        inputId: "input2",
        labelId: "label2",
        todayValueId: "todayValue2",
        todayNameId: "todayName2"
    },

    {
        name: "Raju",
        valueId: "value3",
        inputId: "input3",
        labelId: "label3",
        todayValueId: "todayValue3",
        todayNameId: "todayName3"
    }
];


// ==========================================
// SET NAMES
// ==========================================

people.forEach((person) => {

    document.getElementById(
        person.labelId
    ).textContent = person.name;

    document.getElementById(
        person.todayNameId
    ).textContent = person.name;

});


// ==========================================
// INDIA DATE KEY
// ==========================================

function getIndiaDateKey() {

    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(new Date());

    const result = {};

    parts.forEach((part) => {
        result[part.type] = part.value;
    });

    return `${result.year}-${result.month}-${result.day}`;
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateKey) {

    if (!dateKey) {
        return "--";
    }

    const [year, month, day] =
        dateKey.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatNumber(value) {

    const number = Number(value || 0);

    return number.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );
}


// ==========================================
// CHART
// ==========================================

let progressChart = null;


// ==========================================
// LOAD DATABASE
// ==========================================

onValue(
    numbersRef,
    (snapshot) => {

        const data = snapshot.val();

        if (!data) {
            return;
        }


        // ==================================
        // TOTAL VALUES
        // ==================================

        people.forEach(
            (person, index) => {

                const firebaseKey =
                    `person${index + 1}`;

                const total =
                    Number(
                        data[firebaseKey] || 0
                    );

                document.getElementById(
                    person.valueId
                ).textContent =
                    formatNumber(total);

            }
        );


        // ==================================
        // LAST UPDATED
        // ==================================

        if (data.lastUpdated) {

            document.getElementById(
                "date"
            ).textContent =
                formatDate(
                    data.lastUpdated
                );

        }


        // ==================================
        // TODAY
        // ==================================

        const todayKey =
            getIndiaDateKey();

        const todayData =
            data.history &&
            data.history[todayKey];


        if (todayData) {

            people.forEach(
                (person, index) => {

                    const firebaseKey =
                        `person${index + 1}`;

                    const value =
                        Number(
                            todayData[
                                firebaseKey
                            ] || 0
                        );

                    document.getElementById(
                        person.todayValueId
                    ).textContent =
                        `+${formatNumber(value)}`;

                }
            );

        } else {

            people.forEach(
                (person) => {

                    document.getElementById(
                        person.todayValueId
                    ).textContent = "+0";

                }
            );

        }


        document.getElementById(
            "todayDate"
        ).textContent =
            formatDate(todayKey);


        // ==================================
        // HISTORY
        // ==================================

        buildHistory(
            data.history || {}
        );


        // ==================================
        // CHART
        // ==================================

        buildChart(
            data.history || {}
        );


        // ==================================
        // ADMIN STATUS
        // ==================================

        updateAdminTodayStatus(data);

    }
);


// ==========================================
// BUILD HISTORY TABLE
// ==========================================

function buildHistory(history) {

    const historyBody =
        document.getElementById(
            "historyBody"
        );


    const dates =
        Object.keys(history);


    if (dates.length === 0) {

        historyBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty-history"
                >
                    No daily history yet.
                </td>
            </tr>
        `;

        return;
    }


    // Newest date first

    dates.sort(
        (a, b) =>
            b.localeCompare(a)
    );


    historyBody.innerHTML = "";


    dates.forEach(
        (dateKey) => {

            const day =
                history[dateKey];


            const pintu =
                Number(
                    day.person1 || 0
                );

            const akshay =
                Number(
                    day.person2 || 0
                );

            const raju =
                Number(
                    day.person3 || 0
                );


            const total =
                pintu +
                akshay +
                raju;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${formatDate(dateKey)}
                </td>

                <td>
                    +${formatNumber(pintu)}
                </td>

                <td>
                    +${formatNumber(akshay)}
                </td>

                <td>
                    +${formatNumber(raju)}
                </td>

                <td>
                    +${formatNumber(total)}
                </td>

            `;


            historyBody.appendChild(row);

        }
    );

}


// ==========================================
// BUILD CHART
// ==========================================

function buildChart(history) {

    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (!canvas) {
        return;
    }


    const dates =
        Object.keys(history)
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


    if (dates.length === 0) {

        if (progressChart) {

            progressChart.destroy();

            progressChart = null;

        }

        return;
    }


    // ======================================
    // CREATE CUMULATIVE VALUES
    // ======================================

    let pintuTotal = 0;

    let akshayTotal = 0;

    let rajuTotal = 0;


    const labels = [];

    const pintuData = [];

    const akshayData = [];

    const rajuData = [];


    dates.forEach(
        (dateKey) => {

            const day =
                history[dateKey];


            pintuTotal +=
                Number(
                    day.person1 || 0
                );

            akshayTotal +=
                Number(
                    day.person2 || 0
                );

            rajuTotal +=
                Number(
                    day.person3 || 0
                );


            labels.push(
                formatDate(dateKey)
            );


            pintuData.push(
                pintuTotal
            );

            akshayData.push(
                akshayTotal
            );

            rajuData.push(
                rajuTotal
            );

        }
    );


    // ======================================
    // DESTROY OLD CHART
    // ======================================

    if (progressChart) {

        progressChart.destroy();

    }


    // ======================================
    // CREATE NEW CHART
    // ======================================

    progressChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label: "Pintu",

                            data: pintuData,

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3,

                            fill: false
                        },

                        {
                            label: "Akshay",

                            data: akshayData,

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3,

                            fill: false
                        },

                        {
                            label: "Raju",

                            data: rajuData,

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 3,

                            fill: false
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {
                        mode: "index",
                        intersect: false
                    },


                    plugins: {

                        legend: {

                            labels: {

                                color: "#cbd1df",

                                usePointStyle: true,

                                padding: 20

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            context.dataset.label +
                                            ": " +
                                            formatNumber(
                                                context.parsed.y
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color: "#858da1",

                                maxRotation: 45,

                                minRotation: 0

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"

                            }

                        },


                        y: {

                            beginAtZero: true,

                            ticks: {

                                color: "#858da1",

                                callback:
                                    function(value) {

                                        return formatNumber(
                                            value
                                        );

                                    }

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"

                            }

                        }

                    }

                }

            }
        );

}


// ==========================================
// LOGIN ELEMENTS
// ==========================================

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
        "loginButton"
    );

const loginBox =
    document.getElementById(
        "loginBox"
    );

const updateBox =
    document.getElementById(
        "updateBox"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener(
    "click",
    async () => {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            loginError.textContent =
                "Please enter email and password.";

            return;
        }


        loginError.textContent = "";

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(error);

            loginError.textContent =
                "Invalid email or password.";

        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    }
);


// ==========================================
// ENTER KEY
// ==========================================

passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            loginButton.click();

        }

    }
);


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            loginBox.style.display =
                "none";

            updateBox.style.display =
                "block";

        } else {

            loginBox.style.display =
                "grid";

            updateBox.style.display =
                "none";

        }

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async () => {

        await signOut(auth);

    }
);


// ==========================================
// TODAY STATUS
// ==========================================

function updateAdminTodayStatus(data) {

    const todayKey =
        getIndiaDateKey();


    const alreadyUpdated =
        Boolean(
            data &&
            data.history &&
            data.history[todayKey]
        );


    const message =
        document.getElementById(
            "alreadyUpdated"
        );

    const updateButton =
        document.getElementById(
            "updateButton"
        );


    if (alreadyUpdated) {

        message.style.display =
            "block";

        updateButton.disabled =
            true;

        updateButton.textContent =
            "Today's Numbers Already Added";

    } else {

        message.style.display =
            "none";

        updateButton.disabled =
            false;

        updateButton.textContent =
            "➕ Add Today's Numbers";

    }

}


// ==========================================
// UPDATE NUMBERS
// ==========================================

const updateButton =
    document.getElementById(
        "updateButton"
    );

const status =
    document.getElementById(
        "status"
    );


updateButton.addEventListener(
    "click",
    async () => {

        status.textContent = "";

        updateButton.disabled = true;

        updateButton.textContent =
            "Updating...";


        // ----------------------------------
        // GET VALUES
        // ----------------------------------

        const values =
            people.map(
                (person) => {

                    const input =
                        document.getElementById(
                            person.inputId
                        );

                    return Number(
                        input.value
                    );

                }
            );


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        const valid =
            values.every(
                (value) =>
                    Number.isFinite(value) &&
                    value >= 0
            );


        if (!valid) {

            status.textContent =
                "Please enter valid numbers.";

            updateButton.disabled =
                false;

            updateButton.textContent =
                "➕ Add Today's Numbers";

            return;
        }


        const totalAdded =
            values[0] +
            values[1] +
            values[2];


        if (totalAdded <= 0) {

            status.textContent =
                "Enter at least one number.";

            updateButton.disabled =
                false;

            updateButton.textContent =
                "➕ Add Today's Numbers";

            return;
        }


        const todayKey =
            getIndiaDateKey();


        try {

            // --------------------------------
            // ATOMIC DATABASE UPDATE
            // --------------------------------

            const result =
                await runTransaction(
                    numbersRef,
                    (currentData) => {

                        if (!currentData) {

                            currentData = {};

                        }


                        // ------------------------
                        // DUPLICATE PROTECTION
                        // ------------------------

                        if (
                            currentData.history &&
                            currentData.history[todayKey]
                        ) {

                            return;

                        }


                        // ------------------------
                        // EXISTING TOTALS
                        // ------------------------

                        const current1 =
                            Number(
                                currentData.person1 || 0
                            );

                        const current2 =
                            Number(
                                currentData.person2 || 0
                            );

                        const current3 =
                            Number(
                                currentData.person3 || 0
                            );


                        // ------------------------
                        // ADD NEW VALUES
                        // ------------------------

                        currentData.person1 =
                            current1 + values[0];

                        currentData.person2 =
                            current2 + values[1];

                        currentData.person3 =
                            current3 + values[2];


                        // ------------------------
                        // HISTORY
                        // ------------------------

                        if (!currentData.history) {

                            currentData.history = {};

                        }


                        currentData.history[todayKey] = {

                            person1:
                                values[0],

                            person2:
                                values[1],

                            person3:
                                values[2],

                            updatedAt:
                                new Date().toISOString()

                        };


                        // ------------------------
                        // LAST UPDATED
                        // ------------------------

                        currentData.lastUpdated =
                            todayKey;


                        return currentData;

                    }
                );


            // --------------------------------
            // TRANSACTION FAILED
            // --------------------------------

            if (!result.committed) {

                status.textContent =
                    "⚠️ Today's numbers were already added.";

                updateButton.disabled =
                    true;

                updateButton.textContent =
                    "Today's Numbers Already Added";

                return;
            }


            // --------------------------------
            // SUCCESS
            // --------------------------------

            status.textContent =
                "✅ Today's numbers added successfully!";


            people.forEach(
                (person) => {

                    document.getElementById(
                        person.inputId
                    ).value = "";

                }
            );


        } catch (error) {

            console.error(error);

            status.textContent =
                "❌ Update failed. Please try again.";

            updateButton.disabled =
                false;

            updateButton.textContent =
                "➕ Add Today's Numbers";

        }

    }
);