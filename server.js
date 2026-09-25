const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, "alpha_nexus.db"));

db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  favorite_anime TEXT NOT NULL,
  favorite_genre TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json({limit:"50kb"}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/config", (req,res) => {
  res.json({
    whatsappUrl: process.env.WHATSAPP_URL || "https://www.whatsapp.com/",
    discordUrl: process.env.DISCORD_URL || "https://discord.com/"
  });
});

app.post("/api/register", async (req,res) => {
  try {
    const {username,email,favoriteAnime,favoriteGenre,password} = req.body || {};
    if (!username || username.length < 3 || username.length > 30)
      return res.status(400).json({error:"Username must be 3–30 characters."});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ""))
      return res.status(400).json({error:"Enter a valid email address."});
    if (!favoriteAnime || !favoriteGenre)
      return res.status(400).json({error:"Complete your anime information."});
    if (!password || password.length < 8)
      return res.status(400).json({error:"Password must be at least 8 characters."});

    const hash = await bcrypt.hash(password, 12);
    const stmt = db.prepare(`
      INSERT INTO users (username,email,password_hash,favorite_anime,favorite_genre)
      VALUES (?,?,?,?,?)
    `);
    const info = stmt.run(username,email.toLowerCase(),hash,favoriteAnime,favoriteGenre);

    res.status(201).json({
      message:"Account created",
      user:{id:info.lastInsertRowid,username,favoriteAnime,favoriteGenre}
    });
  } catch (err) {
    if (String(err.message).includes("users.email"))
      return res.status(409).json({error:"That email is already registered."});
    if (String(err.message).includes("users.username"))
      return res.status(409).json({error:"That username is already taken."});
    console.error(err);
    res.status(500).json({error:"Server error. Try again."});
  }
});

app.get("/api/health",(req,res)=>res.json({status:"ok",service:"Alpha Nexus"}));

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Alpha Nexus running on port ${PORT}`));
