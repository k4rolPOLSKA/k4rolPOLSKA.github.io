require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.post("/api/fix", async (req, res) => {

    try {

        const { problem, category } = req.body;

        if (!problem) {
            return res.status(400).json({
                error: "Nie podano problemu."
            });
        }

        const prompt = `
Jesteś OnFix AI — profesjonalnym asystentem diagnostycznym.

Użytkownik ma problem:

${problem}

Kategoria:
${category}

Przeanalizuj problem i przygotuj bezpieczną instrukcję naprawy.

Zwróć WYŁĄCZNIE poprawny JSON w formacie:

{
  "diagnosis": "krótka diagnoza",
  "causes": [
    "możliwa przyczyna 1",
    "możliwa przyczyna 2",
    "możliwa przyczyna 3"
  ],
  "steps": [
    "krok 1",
    "krok 2",
    "krok 3",
    "krok 4"
  ],
  "warning": "ważne ostrzeżenie"
}

Zasady:
- Pisz po polsku.
- Instrukcje mają być proste dla początkującego.
- Nie wymyślaj pewnej diagnozy, jeśli nie masz wystarczających informacji.
- Nie każ użytkownikowi otwierać niebezpiecznych urządzeń.
- Przy ryzykownych czynnościach ostrzeż użytkownika.
- Nie zalecaj kasowania ważnych danych bez ostrzeżenia.
`;

        const response = await client.responses.create({
            model: "gpt-5.6",
            input: prompt
        });

        const text = response.output_text.trim();

        let data;

        try {
            data = JSON.parse(text);
        } catch {

            const cleaned = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            data = JSON.parse(cleaned);
        }

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Nie udało się połączyć z OnFix AI."
        });

    }

});


app.listen(PORT, () => {

    console.log(
        `🚀 OnFix działa: http://localhost:${PORT}`
    );

});
