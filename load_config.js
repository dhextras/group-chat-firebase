const config_file_path = "./config.json";

function loadConfig() {
  try {
    // Attempt to read the config.json file
    return require(config_file_path);
  } catch (error) {
    console.error("\nError loading config.json:", error.message);
    console.log(
      "\nPlease follow step 4 of the installation instructions to solve this.",
      "\n  - https://github.com/dhextras/Group-Chat-Firebase/#installation"
    );
    console.log("\nExiting...\n");
    process.exit(1);
  }
}

module.exports = loadConfig;
