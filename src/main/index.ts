import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/bitmap.png?asset'
import Database from 'better-sqlite3'
import path from 'path'
let db:any

const initDatabase = () => {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'cuan-track.db')
  
  // Buka database
  db = new Database(dbPath)

  // Langsung bikin table di sini (logic createTable lu pindah ke sini)
  const query = `CREATE TABLE IF NOT EXISTS records(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount NUMBER NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    balance NUMBER NOT NULL
  )`;
  db.exec(query)
  
  console.log("DB Ready Bro!")
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    resizable:false,
    width: 900,
    height: 670,
    show: false,
    icon: icon,
    title: "Cuan Track",
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon, wmClass: 'com.cuantrack.app' } : {}),
    webPreferences: {
      spellcheck:false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setTitle("Cuan Track")

  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault()
  })


  if (process.platform === 'linux') {
  mainWindow.setMenuBarVisibility(false);
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle('take-data',() => {
    const rows = db.prepare("SELECT * FROM records ORDER BY id DESC").all()
    return rows
  })

  ipcMain.handle('take-balance', (event, pack) => {
    const amountData = Number(pack.amount);
    const typeData = pack.type;
    const getBalance = db.prepare("SELECT balance FROM records ORDER BY id DESC LIMIT 1").get()
    let lastBalance = getBalance ? getBalance.balance :0
    let newBalance = 0
    if (typeData === 'Income') {
      newBalance = lastBalance + amountData
    } else if (typeData === 'Expense'){
      newBalance = lastBalance - amountData
    }
    const prepare = db.prepare(`INSERT INTO records (title, amount, category, type, note, balance) VALUES (?, ?, ?, ?, ?, ?)`)
    const info = prepare.run(pack.title, pack.amount, pack.category, pack.type, pack.note, newBalance)
    return newBalance;
  })

  ipcMain.handle('get-graph-data', (event, range) => {
    const graphQuery = `
    SELECT * FROM (
    SELECT
      strftime('%d/%m', created_at) as label,
      SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense,
      created_at
    FROM records
    GROUP BY label
    ORDER BY created_at DESC
    LIMIT 7
    ) 
    ORDER BY created_at ASC
    `
    return db.prepare(graphQuery).all()
  })

  ipcMain.handle('delete-data', (event,data) => {
    db.prepare(`DELETE FROM records WHERE id = ?`).run(data)
  })


  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key.toLowerCase() === 'n') {
        mainWindow.webContents.send('open-note')
        event.preventDefault() 
      }
    }

    if (input.key === 'Escape') {
      mainWindow.webContents.send('close-note')
    }
  })

}

if (process.platform === 'linux') {
  app.name = 'Cuan Track'
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (process.platform === 'linux') {
    app.setName('Cuan Track')
  }
  
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.cuantrack.app')
  app.name = "Cuan Track"
  initDatabase()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.