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
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": process.env.SERPER_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ q: query, gl: "sa", hl: "ar", num: 10 })
        });
        const data = await response.json();
        
        // استخراج العنوان، الرابط، الوصف، والسعر المستهدف
        const results = data.organic?.slice(0, 8).map(item => {
            // Serper يضع السعر أحياناً في الحقل المباشر أو داخل الـ attributes
            let itemPrice = "غير محدد";
            if (item.price) {
                itemPrice = item.price;
            } else if (item.attributes?.["Price"]) {
                itemPrice = item.attributes["Price"];
            } else {
                // محاولة ذكية لاستخراج السعر من الـ snippet إذا لم يتوفر كمتغير مستقل
                const priceMatch = item.snippet?.match(/(\d+[\s,.]?\d*)\s*(ريال|رس|SR|SAR)/i);
                if (priceMatch) {
                    itemPrice = `${priceMatch[1]} ريال`;
                }
            }

            return {
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                price: itemPrice
            };
        }) || [];
        
        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: "خطأ في السيرفر" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
