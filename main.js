const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            sandbox: false,
            webSecurity: false // Disable web security
        },
        width: 800
    });

    // Define the path to the 'dist' directory
    const distPath = path.join(app.getAppPath(), 'dist');

    // Log all files in the 'dist' directory
    fs.readdir(distPath, (err, files) => {
        if (err) {
            console.error('Error reading dist directory:', err);
        } else {
            console.log('Available files in dist directory:', files);
        }

        // Load the index.html file after logging the files
        const indexPath = path.join(distPath, 'index.html');

        win.loadFile(indexPath);
    });
}

app.whenReady().then(createWindow);
