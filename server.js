const express = require("express");
const cookieParser = require("cookie-parser");
const { JsonDB, Config } = require("node-json-db");
const qrcode = require("qrcode");
const { authenticator } = require("otplib");

const userDb = new JsonDB(new Config("users", true, true, "/"));

const app = express();
app.use(cookieParser());
app.use(express.static("public"));

// Middleware for Authentication
const authenticate = async (req, res, next) => {
  const { id } = req.cookies;
  if (!id) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  try {
    const user = await userDb.getData("/" + id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something broke!" });
});

// Login user
app.get("/login", async (req, res) => {
  try {
    const { id, password, code } = req.query;
    const user = req.user;
    if (user && user.password === password) {
      if (user["2FA"].enabled && !code) {
        return res.send({ codeRequested: true });
      }
      const verified = authenticator.check(code, user["2FA"].secret);
      if (!verified) throw new Error("Invalid code");
      return res.cookie("id", id).send({ success: true });
    }
    throw new Error("Invalid credentials");
  } catch (err) {
    console.error(err);
    res.status(401).send({ error: err.message });
  }
});

// Generate QR Image
app.get("/qrImage", authenticate, async (req, res) => {
  try {
    const { id } = req.cookies;
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(id, "2FA Tutorial", secret);
    const image = await qrcode.toDataURL(uri);
    req.user["2FA"].tempSecret = secret;
    await userDb.save();
    return res.send({ success: true, image });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false });
  }
});

// Set the 2FA
app.get("/set2FA", authenticate, async (req, res) => {
  try {
    const { code } = req.query;
    const { tempSecret } = req.user["2FA"];
    const verified = authenticator.check(code, tempSecret);
    if (!verified) throw new Error("Invalid code");
    req.user["2FA"] = {
      enabled: true,
      secret: tempSecret,
    };
    await userDb.save();
    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false });
  }
});

// Check current session
app.get("/check", authenticate, (req, res) => {
  const { id } = req.cookies;
  return res.send({ success: true, id });
});

// Logout user
app.get("/logout", (req, res) => {
  res.clearCookie("id");
  res.send({ success: true });
});

app.listen(3000, () => {
  console.log("App is listening on port: 3000");
});
