const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const loadConfig = require('./load_config');
const { initializeApp } = require("firebase/app");
const {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  Timestamp,
  collection,
  arrayUnion,
  getFirestore,
} = require("firebase/firestore");


const { firebaseConfig, PORT } = loadConfig();

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Endpoint to retrieve chat messages for a specific chat room.
 * If the chat room doesn't exist, it creates the room and sends a success message.
 *
 * @param {string} req.params.chatRoomId - The ID of the chat room to retrieve messages for.
 * @returns {Object} JSON object containing the chat room data.
 */
app.get("/getChatMessages/:chatRoomId", async (req, res) => {
  const requestedChatRoomId = req.params.chatRoomId;
  try {
    const chatRoomRef = collection(db, requestedChatRoomId);
    let chatRoomSnapshot = await getDocs(chatRoomRef);

    if (chatRoomSnapshot.size === 0) {
      // Initialize new room if the chat room doesn't exist
      const newChatRoomDoc = doc(db, requestedChatRoomId, "server");
      setDoc(newChatRoomDoc, {
        messages: [
          {
            timeStamp: Timestamp.fromDate(new Date()),
            message: `Room ${requestedChatRoomId} has been successfully created.`,
          },
        ],
        name: "server",
      });

      chatRoomSnapshot = await getDocs(chatRoomRef);
    }

    const chatRoomData = chatRoomSnapshot.docs.map((doc) => doc.data());
    res.json(chatRoomData);
  } catch (error) {
    const errorData = { error: error.message };
    res.status(500).json(errorData);
  }
});

/**
 * Endpoint to handle sending a message in the chat room.
 * If the user exists, the message is added to their messages.
 * If the user does not exist, a new user is created.
 *
 * @param {string} req.body.userName - The username of the sender.
 * @param {string} req.body.message - The message to be sent.
 * @param {string} req.body.chatRoomId - The ID of the chat room to send the message to.
 */
app.post("/sendMessage", async (req, res) => {
  const { userName, message, chatRoomId } = req.body;

  try {
    const userDocRef = doc(db, chatRoomId, userName);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      // Update existing user's messages
      await updateDoc(userDocRef, {
        messages: arrayUnion({
          timeStamp: Timestamp.fromDate(new Date()),
          message: message,
        }),
      });
    } else {
      // Create a new user with the provided message
      await setDoc(userDocRef, {
        messages: [{ timeStamp: Timestamp.fromDate(new Date()), message }],
        name: userName,
      });
    }

    res.status(200).send("Message sent successfully.");
  } catch (error) {
    res.status(500).send("Error sending message.");
  }
});

server.listen(PORT, () => {
  console.log(`\nServer is running on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("sendMessageToRoom", ({ roomId, message }) => {
    io.to(roomId).emit("broadcastMessageToRoom", { message });
  });
});
