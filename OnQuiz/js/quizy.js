const quizy = {

    geografia: {
        title: "Jak dobrze znasz świat?",
        category: "Geografia",
        icon: "🌍",
        questions: [
            {
                question: "Jaka jest stolica Polski?",
                answers: ["Kraków", "Warszawa", "Gdańsk", "Wrocław"],
                correct: 1
            },
            {
                question: "Który kontynent jest największy?",
                answers: ["Europa", "Afryka", "Azja", "Australia"],
                correct: 2
            },
            {
                question: "Ile jest oceanów na Ziemi?",
                answers: ["3", "4", "5", "7"],
                correct: 2
            }
        ]
    },

    historia: {
        title: "Historia Polski",
        category: "Historia",
        icon: "🏛️",
        questions: [
            {
                question: "W którym roku Polska przyjęła chrzest?",
                answers: ["966", "1000", "1025", "1410"],
                correct: 0
            },
            {
                question: "Kto był pierwszym królem Polski?",
                answers: ["Mieszko I", "Bolesław Chrobry", "Kazimierz Wielki", "Władysław Jagiełło"],
                correct: 1
            },
            {
                question: "W którym roku odbyła się bitwa pod Grunwaldem?",
                answers: ["966", "1226", "1410", "1525"],
                correct: 2
            }
        ]
    },

    technologia: {
        title: "Technologiczny test",
        category: "Technologia",
        icon: "💻",
        questions: [
            {
                question: "Co oznacza skrót HTML?",
                answers: [
                    "HyperText Markup Language",
                    "HighText Machine Language",
                    "HyperTool Modern Language",
                    "HomeText Markup Language"
                ],
                correct: 0
            },
            {
                question: "Który język działa w przeglądarce?",
                answers: ["JavaScript", "C", "Assembly", "COBOL"],
                correct: 0
            },
            {
                question: "Co oznacza CSS?",
                answers: [
                    "Computer Style System",
                    "Cascading Style Sheets",
                    "Creative Style System",
                    "Code Style Sheets"
                ],
                correct: 1
            }
        ]
    }
};
