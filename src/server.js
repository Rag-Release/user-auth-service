const app = require("./webserver/express-app");
const config = require("./config/config");
const databaseConnection = require("./database/postgres"); // Import the database connection

const PORT = config.port;

async function startServer() {
  try {
    // Check if the database is connected before starting the server
    const isDbConnected = await databaseConnection.connect();

    if (isDbConnected) {
      // If the database is connected, start the server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error("Database connection failed. Server not started.");
      process.exit(1); // Exit the process if DB connection fails
    }
  } catch (error) {
    console.error("Error checking the database connection:", error);
    process.exit(1); // Exit the process if there's an error
  }
}

// Call the function to start the server
startServer();
