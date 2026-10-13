import { BrowserWindow, screen } from "electron"
import { AppState } from "main"
import path from "node:path"

const isDev = process.env.NODE_ENV === "development"

const startUrl = isDev
  ? "http://localhost:5180"
  : `file://${path.join(__dirname, "../dist/index.html")}`

export class WindowHelper {
  private mainWindow: BrowserWindow | null = null
  private isWindowVisible: boolean = false
  private windowPosition: { x: number; y: number } | null = null
  private windowSize: { width: number; height: number } | null = null
  private appState: AppState

  private screenWidth: number = 0
  private screenHeight: number = 0
  private step: number = 20
  private currentX: number = 0
  private currentY: number = 0

  constructor(appState: AppState) {
    this.appState = appState
  }

  public setWindowDimensions(width: number, height: number): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    const [currentX, currentY] = this.mainWindow.getPosition()
    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize

    const maxAllowedWidth = Math.floor(
      workArea.width * (this.appState.getHasDebugged() ? 0.75 : 0.5)
    )

    const newWidth = Math.min(width + 32, maxAllowedWidth)
    const newHeight = Math.ceil(height)
    const maxX = workArea.width - newWidth
    const newX = Math.min(Math.max(currentX, 0), maxX)

    this.mainWindow.setBounds({
      x: newX,
      y: currentY,
      width: newWidth,
      height: newHeight
    })

    this.windowPosition = { x: newX, y: currentY }
    this.windowSize = { width: newWidth, height: newHeight }
    this.currentX = newX
  }

  public createWindow(): void {
    if (this.mainWindow !== null) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    this.screenWidth = workArea.width
    this.screenHeight = workArea.height

    const windowSettings: Electron.BrowserWindowConstructorOptions = {
      width: 400,
      height: 600,
      minWidth: 300,
      minHeight: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: false
      },
      show: false,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      fullscreenable: false,
      hasShadow: false,
      backgroundColor: "#00000000",
      focusable: true,
      resizable: true,
      movable: true,
      skipTaskbar: true,
      x: 100,
      y: 100
    }

    this.mainWindow = new BrowserWindow(windowSettings)

    // Primary stealth trigger: Exclude window from all OS capture buffers
    this.mainWindow.setContentProtection(true)

    if (process.platform === "darwin") {
      this.mainWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
      })
      this.mainWindow.setHiddenInMissionControl(true)
      this.mainWindow.setAlwaysOnTop(true, "screen-saver")
    } else {
      this.mainWindow.setAlwaysOnTop(true, "screen-saver")
    }

    if (process.platform === "linux" && this.mainWindow.setHasShadow) {
      this.mainWindow.setHasShadow(false)
    }

    this.mainWindow.loadURL(startUrl).catch((err) => {
      console.error("Failed to load URL:", err)
    })

    this.mainWindow.once("ready-to-show", () => {
      if (this.mainWindow) {
        this.centerWindow()
        this.mainWindow.setContentProtection(true)
        this.mainWindow.show()
        this.mainWindow.focus()
        this.mainWindow.setAlwaysOnTop(true, "screen-saver")
      }
    })

    const bounds = this.mainWindow.getBounds()
    this.windowPosition = { x: bounds.x, y: bounds.y }
    this.windowSize = { width: bounds.width, height: bounds.height }
    this.currentX = bounds.x
    this.currentY = bounds.y

    this.setupWindowListeners()
    this.isWindowVisible = true
  }

  private setupWindowListeners(): void {
    if (!this.mainWindow) return

    this.mainWindow.on("move", () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds()
        this.windowPosition = { x: bounds.x, y: bounds.y }
        this.currentX = bounds.x
        this.currentY = bounds.y
      }
    })

    this.mainWindow.on("resize", () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds()
        this.windowSize = { width: bounds.width, height: bounds.height }
      }
    })

    this.mainWindow.on("closed", () => {
      this.mainWindow = null
      this.isWindowVisible = false
      this.windowPosition = null
      this.windowSize = null
    })
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public isVisible(): boolean {
    return this.isWindowVisible
  }

  public hideMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    const bounds = this.mainWindow.getBounds()
    this.windowPosition = { x: bounds.x, y: bounds.y }
    this.windowSize = { width: bounds.width, height: bounds.height }
    this.mainWindow.hide()
    this.isWindowVisible = false
  }

  public showMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    if (this.windowPosition && this.windowSize) {
      this.mainWindow.setBounds({
        x: this.windowPosition.x,
        y: this.windowPosition.y,
        width: this.windowSize.width,
        height: this.windowSize.height
      })
    }

    this.mainWindow.setContentProtection(true)
    this.mainWindow.showInactive()
    this.isWindowVisible = true
  }

  public toggleMainWindow(): void {
    if (this.isWindowVisible) {
      this.hideMainWindow()
    } else {
      this.showMainWindow()
    }
  }

  private centerWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    
    const windowBounds = this.mainWindow.getBounds()
    const windowWidth = windowBounds.width || 400
    const windowHeight = windowBounds.height || 600
    
    const centerX = Math.floor((workArea.width - windowWidth) / 2)
    const centerY = Math.floor((workArea.height - windowHeight) / 2)
    
    this.mainWindow.setBounds({
      x: centerX,
      y: centerY,
      width: windowWidth,
      height: windowHeight
    })
    
    this.windowPosition = { x: centerX, y: centerY }
    this.windowSize = { width: windowWidth, height: windowHeight }
    this.currentX = centerX
    this.currentY = centerY
  }

  public centerAndShowWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    this.centerWindow()
    this.mainWindow.setContentProtection(true)
    this.mainWindow.show()
    this.mainWindow.focus()
    this.mainWindow.setAlwaysOnTop(true, "screen-saver")
    this.isWindowVisible = true
  }

  public moveWindowRight(): void {
    if (!this.mainWindow) return
    const windowWidth = this.windowSize?.width || 0
    const halfWidth = windowWidth / 2
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentX = Math.min(this.screenWidth - halfWidth, this.currentX + this.step)
    this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY))
  }

  public moveWindowLeft(): void {
    if (!this.mainWindow) return
    const windowWidth = this.windowSize?.width || 0
    const halfWidth = windowWidth / 2
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentX = Math.max(-halfWidth, this.currentX - this.step)
    this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY))
  }

  public moveWindowDown(): void {
    if (!this.mainWindow) return
    const windowHeight = this.windowSize?.height || 0
    const halfHeight = windowHeight / 2
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentY = Math.min(this.screenHeight - halfHeight, this.currentY + this.step)
    this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY))
  }

  public moveWindowUp(): void {
    if (!this.mainWindow) return
    const windowHeight = this.windowSize?.height || 0
    const halfHeight = windowHeight / 2
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentY = Math.max(-halfHeight, this.currentY - this.step)
    this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY))
  }
}