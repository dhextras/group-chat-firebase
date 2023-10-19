# Group-Chat-Firebase

This is a basic Web based Group Chat App, Created with Express and Firebase firestore.


### Prerequisites

- Node.js and npm installed on your machine.
- A Firebase Project.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/dhextras/group-chat-firebase.git && cd group-chat-firebase/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase Project and Web App:

   - Follow the official Firebase documentation to create a Firebase project and set up a web app. [Firebase Web Setup Documentation](https://firebase.google.com/docs/web/setup)

   - After completing this setup, you will obtain a Firebase configuration object.

4. Update Configuration and Port:

  - Update the `config.json` file in this project with your Firebase configuration details and the desired port number. Make sure to use double quotes (`""`) for the keys inside the `firebaseConfig` object.

  ```json
  // Incorrect format (without double quotes for keys):
  {
    "firebaseConfig": {
      apiKey: "YOUR_API_KEY",
      // rest of the config...
    },
    "port": 3000
  }

  // Correct format (with double quotes for keys):
  {
    "firebaseConfig": {
      "apiKey": "YOUR_API_KEY",
      // rest of the config...
    },
    "port": 3000
  }
  ```

  - Rename `config_test.json` to `config.json`, You are good to go.

### Usage

Start the server using:
```bash
npm start
```

- Hooray!! Access the server at `http://localhost:3000`.

### Contributing

Feel free to contribute to this project by opening issues or pull requests.

## API Endpoints

1. **Home Route**
   - **Route:** `/`
   - **Method:** `GET`
   - **Description:** Home route for the application.

2. **Get Chat Messages**
   - **Route:** `/getChatMessages/:chatRoomId`
   - **Method:** `GET`
   - **Description:** Retrieves messages associated with the specified chat room ID from Firestore.
   - **Parameters:**
     - `chatRoomId` (path parameter): Unique identifier of the chat room.

3. **Send Messages**
   - **Route:** `/sendMessages`
   - **Method:** `POST`
   - **Description:** Stores a message in Firestore within the specified chat room for a particular user.
   - **Request Body:**
     - `chatRoomId`: Unique identifier of the chat room where the message will be stored.
     - `userName`: Name of the user sending the message.
     - `message`: Content of the message to be sent.

```json
// Example request body for sending a message
{
  "chatRoomId": "ABC123",
  "userName": "Dhextras",
  "message": "Hello, how are you?"
}
```

### License

This project is licensed under the [MIT License](LICENSE).

---
#### Note: 
Ensure that you do not expose your actual Firebase configuration or any sensitive information publicly. The Firebase configuration should be kept secure and not shared publicly.
