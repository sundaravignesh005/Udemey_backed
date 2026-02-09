// // =========================
// // CORE IMPORTS
// // =========================
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const express = require("express");
// const mongoose = require("mongoose");
// const path = require("path");
// const bodyParser = require("body-parser");
// require("dotenv").config();

// const app = express();
// const httpServer = http.createServer(app);

// // =========================
// // BASIC MIDDLEWARE
// // =========================
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors());

// // IMPORTANT: Webhook route must be BEFORE express.json()
// // because Stripe needs raw body for signature verification
// const stripeWebhookRoutes = require("./routes/stripeWebhook");
// app.use("/api/stripe", stripeWebhookRoutes);

// app.use(express.json());
// // STATIC FILES
// // =========================
// app.use("/images", express.static(path.join(__dirname, "images")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // =========================
// // GLOBAL HEADERS
// // =========================
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// // =========================
// // SOCKET.IO SETUP
// // =========================
// const io = new Server(httpServer, {
//   cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
// });

// const Chat = require("./model/Chat");

// io.on("connection", (socket) => {
//   console.log("⚡ User connected:", socket.id);

//   socket.on("joinRoom", async ({ roomId, userId, userName }) => {
//     socket.join(roomId);

//     let chat = await Chat.findOne({ roomId });
//     if (!chat) {
//       chat = new Chat({ roomId, participants: [userId], messages: [] });
//     } else {
//       if (!chat.participants.includes(userId)) chat.participants.push(userId);
//     }

//     await chat.save();
//     io.to(roomId).emit("roomJoined", { roomId, userId, userName });
//   });

//   socket.on("sendMessage", async (data) => {
//     const message = {
//       senderId: data.senderId,
//       senderName: data.senderName,
//       senderRole: data.senderRole,
//       receiverId: data.receiverId,
//       text: data.text,
//       type: data.type || "text",
//       isRead: false,
//       createdAt: new Date(),
//     };

//     await Chat.findOneAndUpdate(
//       { roomId: data.roomId },
//       {
//         $push: { messages: message },
//         $set: { updatedAt: new Date() },
//       },
//       { new: true, upsert: true }
//     );

//     io.to(data.roomId).emit("receiveMessage", { roomId: data.roomId, message });
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ User disconnected:", socket.id);
//   });
// });

// // =========================
// // ROUTES IMPORT
// // =========================
// const authrouter = require("./routes/auth");
// const userRouter = require("./routes/userRoute");
// const courseRoute = require("./routes/coursecreation");
// const paymentRoute = require("./routes/payment");
// const purchasedCoursesRoute = require("./routes/purchasedCourses");
// const videoRoute = require("./routes/videoUpload");
// const chatRoute = require("./routes/chat");
// const coursesRoute = require("./routes/courses");
// const orderRoutes = require("./routes/order");

// // ⭐ Stripe Routes (NEW IMPORTANT PART)
// const paymentRoutes = require("./routes/paymentRoutes");

// // =========================
// // API ROUTES
// // =========================
// app.use("/auth", authrouter);
// app.use("/userAuth", userRouter);
// app.use("/courseCreation", courseRoute);
// app.use("/payment", paymentRoute);
// app.use("/purchased-courses", purchasedCoursesRoute);
// app.use("/video", videoRoute);
// app.use("/chat", chatRoute);
// app.use("/api/courses", coursesRoute);

// // ⭐ Official Stripe API Endpoint
// // frontend will call: POST http://localhost:8080/api/payments/create
// app.use("/api/payments", paymentRoutes);

// app.use("/api/orders", orderRoutes);
// // Alias
// app.use("/api", orderRoutes);

// // =========================
// // 404 HANDLER
// // =========================
// app.use((req, res) => {
//   res.status(404).send("Route not found: " + req.originalUrl);
// });

// // =========================
// // MONGO CONNECT + SERVER START
// // =========================
// mongoose
//   .connect("mongodb://127.0.0.1:27017/udemyclone")
//   .then(() => {
//     console.log(" MongoDB Connected 🚀");

//     httpServer.listen(8080, () => {
//       console.log(" Server running at http://localhost:8080");
//       console.log(" Chat Server Ready 💬");
//       console.log(" Stripe Payments Ready 💸");
//     });
//   })
//   .catch((err) => console.log("DB Error:", err));





// =========================
// CORE IMPORTS
// =========================
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// =========================
// BASIC MIDDLEWARE
// =========================
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: "*", credentials: true }));

// =========================
// STRIPE WEBHOOK (RAW BODY FIRST)
// =========================
const stripeWebhookRoutes = require("./routes/stripeWebhook");
app.use("/api/stripe", stripeWebhookRoutes);

app.use(express.json());

// =========================
// STATIC FILES
// =========================
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// GLOBAL HEADERS
// =========================
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// =========================
// SOCKET.IO SETUP (NO LOGIC CHANGE)
// =========================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const Chat = require("./model/Chat");

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", async ({ roomId, userId, userName }) => {
    socket.join(roomId);

    let chat = await Chat.findOne({ roomId });
    if (!chat) {
      chat = new Chat({ roomId, participants: [userId], messages: [] });
    } else {
      if (!chat.participants.includes(userId)) chat.participants.push(userId);
    }

    await chat.save();
    io.to(roomId).emit("roomJoined", { roomId, userId, userName });
  });

  socket.on("sendMessage", async (data) => {
    const message = {
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      receiverId: data.receiverId,
      text: data.text,
      type: data.type || "text",
      isRead: false,
      createdAt: new Date(),
    };

    await Chat.findOneAndUpdate(
      { roomId: data.roomId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() },
      },
      { new: true, upsert: true }
    );

    io.to(data.roomId).emit("receiveMessage", { roomId: data.roomId, message });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// =========================
// ROUTES
// =========================
app.use("/auth", require("./routes/auth"));
app.use("/userAuth", require("./routes/userRoute"));
app.use("/courseCreation", require("./routes/coursecreation"));
app.use("/payment", require("./routes/payment"));
app.use("/purchased-courses", require("./routes/purchasedCourses"));
app.use("/video", require("./routes/videoUpload"));
app.use("/chat", require("./routes/chat"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/orders", require("./routes/order"));
app.use("/api", require("./routes/order"));

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).send("Route not found: " + req.originalUrl);
});

// =========================
// DB + SERVER START (FIXED)
// =========================
const PORT = process.env.PORT || 10000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected 🚀");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Chat Server Ready 💬");
      console.log("Stripe Payments Ready 💸");
    });
  })
  .catch((err) => console.log("DB Error:", err));
