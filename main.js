"use stric"
//app call

const {app, BrowserWindow, Menu, shell,ipcMain} = require ("electron");
const path = require('path');
require("electron-reload")(__dirname);

//bugs fix(?)
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-features','OutOfBlinkCors');
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-web-security')
//Electron Security Warning (Insecure Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true;



//App size 
const createWindows = () => {
    window = new BrowserWindow ({
        width: 1200,
        height: 720,
        //transparent:true,
        //frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: __dirname+ "./src/ui/assets/img/mini-icon_colours.png"
    });

    //init at:
    window.loadFile("./src/ui/index.html");

    //devtools on
    window.webContents.openDevTools();

    var menu = Menu.buildFromTemplate([{
        label: "Menu",
        submenu: [
            {
                label: "About scrapping",
                click(){
                    shell.openExternal("https://es.wikipedia.org/wiki/Web_scraping")
                }
            },
            {
                label: "About Us",
                click(){
                    shell.openExternal("https://github.com/erwinlean")
                }
            },
            {
                label: "Exit",
                click(){
                    app.quit();
            }}]
}])
    Menu.setApplicationMenu(menu);
}

ipcMain.on(`display-app-menu`, function(e, args) {
    if (isWindows && mainWindow) {
        Menu.popup({
        window: mainWindow,
        x: args.x,
        y: args.y
    });
    }
});

//Check version
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

//windows open when ready and close windows
app.whenReady().then(() => {
    createWindows();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindows();
        }
    })
})
    
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})