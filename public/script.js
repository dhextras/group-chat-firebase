const socket = io();
const homePage = document.getElementById("home-page");
const roomInfo = document.getElementById("room-info");
const roomPage = document.getElementById("room-page");
const userName = document.getElementById("user-name");
const chatRoomId = document.getElementById("chat-room-id");
const messageInput = document.getElementById("message-input");
const loadingScreen = document.getElementById("loading-screen");
const messageContainer = document.getElementById("message-container");

/*
  `getChatMessages`: Retrieves chat messages for a specific room.
  `sendMessageToRoom`: Sends a message to the chat room, stores the data, and broadcasts it to all clients in that room.
*/

async function getChatMessages(chatRoomId) {
  try {
    const chatMessagesResponse = await fetch(`/getChatMessages/${chatRoomId}`);
    const chatMessages = await chatMessagesResponse.json();

    if (!chatMessages || !Array.isArray(chatMessages)) {
      console.log("No chat messages available to display.");
      return;
    }

    sortMessages(chatMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
  }
}
async function sendMessageToRoom() {
  if (!messageInput.value || !userName.value || !chatRoomId.value) {
    return;
  }

  if (checkRestrictedWords(messageInput.value)) {
    console.log("Words not allowed hehehe");
    return;
  }

  const messageContent = {
    userName: userName.value,
    message: messageInput.value,
    chatRoomId: chatRoomId.value,
  };

  messageInput.value = "";

  try {
    const response = await fetch("/sendMessage", {
      method: "POST",
      body: JSON.stringify(messageContent),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (response.ok) {
      socket.emit("sendMessageToRoom", {
        roomId: chatRoomId.value,
        message: messageContent,
      });
      console.log("Message sent successfully.");
    } else {
      console.error("Error sending message to firebase:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

socket.on("broadcastMessageToRoom", ({ message }) => {
  appendMessageToChat(message);
});

/* 
  These functions below are boilerplate codes
  providing generic functionality for features such as,
  sorting messages and formating time stamps.. etc,
  No needed to dive into it much.
*/

function formatTimestamp(timeStamp) {
  const dateTimeOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };

  return timeStamp.toLocaleString("en-US", dateTimeOptions);
}
function handleKeyDown(event, inputId) {
  const actionMap = {
    sendMessageToRoom: sendMessageToRoom,
    joinChatRoom: joinChatRoom,
  };

  if (event.key === "Enter") {
    event.preventDefault();
    const actionFunction = actionMap[inputId];
    if (actionFunction) {
      actionFunction();
    }
  }
}

async function joinChatRoom() {
  if (!userName.value || !chatRoomId.value) {
    alert("Please enter your name and chat room ID.");
    return;
  }

  roomInfo.innerHTML = `
    <span id='userId'> User: ${userName.value}</span>
    <span id='chatId'>Room Id: ${chatRoomId.value} </span>
    `;

  homePage.style.display = "none";
  loadingScreen.style.display = "block";

  await getChatMessages(chatRoomId.value);
  socket.emit("joinRoom", chatRoomId.value);

  loadingScreen.style.display = "none";
  roomPage.style.display = "block";
  roomPage.style.display = "flex";
}
function leaveRoom() {
  [userName, chatRoomId, messageInput].forEach((input) => (input.value = ""));
  [roomInfo, messageContainer].forEach((element) => (element.innerHTML = ""));

  socket.emit("leaveRoom", chatRoomId.value);
  roomPage.style.display = "none";
  homePage.style.display = "block";
  homePage.style.display = "flex";
}

function checkRestrictedWords(message) {
  const restrictedWords = [
    "m",
    "hm",
    "ha",
    "mm",
    "hmm",
    "haa",
    "mmm",
    "hmmm",
    "haa",
    "mmmm",
    "hmmmm",
    "haaaa",
    "mmmmm",
    "hmmmmm",
    "haaaaa",
  ];

  const formattedMessage = message.replace(/\s/g, "").toLowerCase();

  const isRestricted = restrictedWords.includes(formattedMessage);

  return isRestricted;
}
function sortMessages(data) {
  const allMessages = [];

  data.forEach((user) => {
    const userName = user.name;

    user.messages.forEach((message) => {
      const timestampInMillis =
        message.timeStamp.seconds * 1000 + message.timeStamp.nanoseconds / 1e6;
      const timeStamp = new Date(timestampInMillis);

      allMessages.push({
        userName: userName,
        message: message.message,
        timeStamp: timeStamp,
      });
    });
  });

  allMessages.sort((a, b) => a.timeStamp - b.timeStamp);

  messageContainer.innerHTML = "";

  allMessages.forEach((message) => {
    appendMessageToChat(message);
  });

  scrollToBottom();
}
function appendMessageToChat(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const messageTextElement = document.createElement("div");
  messageTextElement.classList.add("message-text");

  const timeStamp = message.timeStamp || new Date();

  messageTextElement.innerHTML = `
    <span class="username">${message.userName} -</span>
    <span class="time">${formatTimestamp(timeStamp)}</span><br>
    ${message.message}`;

  messageDiv.appendChild(messageTextElement);
  messageContainer.appendChild(messageDiv);

  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}