// Import necessary Stream Deck libraries
const { openStreamDeck } = require('@elgato-stream-deck/node');
const path = require('path');
const steamAPI = require('steam-user'); // Using Steam-user API for interfacing with Steam

// Import additional required libraries
const fs = require('fs');
const notifier = require('node-notifier');
const archiver = require('archiver');

// Initialize the Stream Deck
const streamDeck = openStreamDeck();

// Initialize Steam API Client
const steamClient = new steamAPI();

// Set default status icons
let iconOnline = path.join(__dirname, 'images', 'online.png');
let iconInvisible = path.join(__dirname, 'images', 'invisible.png');

// Initial user-configurable settings
let currentStatus = 'online'; // Possible options: 'online', 'invisible'
let showAlert = true; // Show on-screen alert after status change

// Function to toggle status between online and invisible
function toggleSteamStatus() {
  if (currentStatus === 'online') {
    currentStatus = 'invisible';
    steamClient.setPersona(steamAPI.EPersonaState.Invisible);
    streamDeck.fillImage(0, fs.readFileSync(iconInvisible));
  } else {
    currentStatus = 'online';
    steamClient.setPersona(steamAPI.EPersonaState.Online);
    streamDeck.fillImage(0, fs.readFileSync(iconOnline));
  }
  // Show alert if enabled
  if (showAlert) {
    console.log(`Steam status changed to: ${currentStatus}`);
    showOnScreenAlert(`Steam status changed to: ${currentStatus}`);
  }
}

// Function to show on-screen alert
function showOnScreenAlert(message) {
  notifier.notify({
    title: 'Stream Deck Plugin',
    message: message,
    timeout: 1, // Show alert for 1 second
  });
}

// Listen for button press event
if (streamDeck) {
  console.log('Stream Deck is initialized.');
  console.log('Available methods on streamDeck:', Object.keys(streamDeck));
} else {
  console.error('Failed to initialize Stream Deck.');
}

// Allow user to change icons via Stream Deck software settings
function setIcons(iconPath1, iconPath2) {
  if (fs.existsSync(iconPath1) && fs.existsSync(iconPath2)) {
    iconOnline = iconPath1;
    iconInvisible = iconPath2;
  } else {
    console.error('Icon paths are invalid.');
  }
}

// Allow user to toggle alert setting
function toggleAlertSetting() {
  showAlert = !showAlert;
}

// Expose configuration functions for Stream Deck software
module.exports = {
  toggleSteamStatus,
  setIcons,
  toggleAlertSetting,
};

// Corrected manifest file creation for Stream Deck Plugin
const manifest = {
  Actions: [
    {
      UUID: 'com.yourname.steamstatustoggle',
      Name: 'Steam Status Toggle',
      Tooltip: 'Toggle Steam Status',
      Icon: 'images/online',
      States: [
        {
          Image: 'images/online',
          Title: 'Online',
          ShowTitle: false,
        },
        {
          Image: 'images/invisible',
          Title: 'Invisible',
          ShowTitle: false,
        },
      ],
    },
  ],
  SDKVersion: 2,
  Version: '1.0',
  Author: 'Your Name',
  Description: 'A plugin to toggle Steam status between Online and Invisible.',
  Category: 'Utility',
  Icon: 'images/online',
  Name: 'Steam Status Toggle',
};

// Write manifest to file
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Script to package the plugin for Windows with additional logging
function packagePlugin() {
  console.log('Starting packaging process...');
  const output = fs.createWriteStream(path.join(__dirname, 'steam-status-toggle.streamDeckPlugin'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  output.on('close', function () {
    console.log('Plugin packaged successfully. Total bytes: ' + archive.pointer());
  });

  output.on('error', function (err) {
    console.error('Error writing output:', err);
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn('Archiver warning:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    console.error('Error creating archive:', err);
    throw err;
  });

  archive.pipe(output);

  // Explicitly add files needed for the plugin
  console.log('Adding files to the archive...');
  archive.file(path.join(__dirname, 'index.js'), { name: 'index.js' });
  archive.file(path.join(__dirname, 'manifest.json'), { name: 'manifest.json' });
  archive.directory(path.join(__dirname, 'images'), 'images');

  console.log('Finalizing the archive...');
  archive.finalize();
}

// Call the packagePlugin function to create the plugin package
packagePlugin();