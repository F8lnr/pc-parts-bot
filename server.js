require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/search", async (req, res) => {
    const { query } = req.body;
    try {
        // شلنا تقييد موقع أمازون وخليناه يبحث في المتاجر السعودية بشكل عام عشان تطلع الشاشات والقطع
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": process.env.SERPER_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ q: `${query} السعودية سعر`, gl: "sa", hl: "ar" })
        });
        const data = await response.json();
        const results = data.organic?.slice(0, 5).map(item => ({
            title: item.title, link: item.link, snippet: item.snippet
        })) || [];
        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
