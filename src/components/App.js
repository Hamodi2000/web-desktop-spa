import { applications, getMaxId, getZIndex } from '../main'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    .main-div {
      border-radius: 10px;
      position: absolute;
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 400px;
      width: 300px;
      gap: 0;
      top: 15%;
      left: 20%
      border-color: transparent;
      box-shadow: 0 0 2px 2px rgba(0,0,0,0.2)
    }
    .main-div.stacked {
      transform: translate(-50%, -50%) translateY(100%); /* Adds vertical offset for stacking */
    }
    .main-div header {
      position: relative;
      display: flex;
      background-color: rgb(185, 79, 79);
      border-radius: 10px 10px 0 0;
      align-items: center;
      gap: 70px;
      box-sizing: border-box;
      height: 40px;
      cursor: grab;
      border-color: transparent;
    }
    .main-div main {
      background-color: rgb(218, 218, 218);
      
    }
    .icon {
      position: absolute;
      display: inline;
      left: 5px;
      cursor: default;
    }
    .settings {
      position: absolute;
      display: inline;
      left: 30px;
      cursor: pointer;
    }
    img {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .tools {
      position: absolute;
      right: 3px;
      display: flex;
      gap: 4px;
    }
    #settings-div {
      position: absolute;
      display: none;
      background-color: white;
      width: 200px;
      height: auto;
      left: 15%;
      bottom: 15%;
      box-shadow: 0 0 5px 5px rgba(0,0,0,0.2);
      border-radius: 5px;
      z-index: 5;
    }
    .settings-input {
      display: flex;
      position: relative;
      border-radius: 5px;
      border: solid 1px;
      outline: none;
      margin: 10px auto;
      box-shadow: 0 0 2px 2px rgba(0,0,0,0.2);
      width: 150px;
      height: 20px;
      font-weight: light;
      font-size: 15px;
    }
    .buttons {
      display: inline;  
      border-radius: 10px;
      border: solid 0;
      box-shadow: 0 0 3px 3px rgba(0,0,0,0.3);
      width: 60px;
      height: 25px;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: bold;
      background-color: rgb(124, 198, 254);
      cursor: pointer;
    }
    .buttons-div {
      display: flex;
      gap: 15px;
      margin: 15px auto;
      width: fit-content;
    }
    .labels-div {
      display: flex;
      margin: 5px;
      border-radius: 8px;
      background-color: rgb(124, 198, 254);
      padding: 4px;
      word-wrap: break-word;
    }
    .username-label, .server-label {
      font-weight: bold;
    }
    *::-webkit-scrollbar {
      width: 10px;
    }
    *::-webkit-scrollbar-thumb {
      background-color:rgb(124, 198, 254);
      border-radius: 5px; 
      border: 2px solid #f9f9f9;
    }
    *::-webkit-scrollbar-track {
      background-color: white;
      border-radius: 5px;
    }
    .win-div {
      display: none;
      position: absolute;
      flex-wrap: wrap;
      background-color: white;
      justify-content: center;
      width: 250px;
      border-radius: 5px;
      justify-self: center;
      margin: 10px 25px;
      z-index: 5;
    }
    .win-label {
      display: block;
      position: relative;
      font-size: 20px;
      font-weight: bolder;
      margin: 0px 0px;
        
    }
  </style>
    <div class='main-div'>
      <header>
        <img class='icon' src='' alt=''>
        <img class='settings' src='/img/settings.png' alt=''>
        <ul class='tools' >
        <img src='/img/minimize.png' class='minimize'>
        <img src='/img/maximize.png' class='maximize'>
        <img src='/img/exit.png' class='exit'>
        </ul>
      </header>
      <div id='settings-div'>
          <div class='labels-div'>
            <label id='current-username'>
              Username:
            </label>
            <label class='username-label'>
            </label>
          </div>
          <div class='labels-div'>
            <label id='current-server'>
              Server:
            </label>
            <label class='server-label'>
            
            </label>
          </div>
          <input type='text' placeholder='Choose a username...' class='settings-input' id='username'></input>
          <input type='text' placeholder='Choose a server to...' class='settings-input' id='server'></input>
          <div class='buttons-div'>
            <button class='buttons' id='save-button'>
              Save
            </button>
            <button class='buttons' id='exit-button'>
              Exit
            </button>
          </div>
            
        </div>
      <main> 
        
        <div class='win-div'>
          🎉🎉🎉🎉🎉🎉🎉🎉
          <label class='win-label'>
            🎉Congratulations!🎉<br>
            🎉you won the game!🎉
          </label>
          🎉🎉🎉🎉🎉🎉🎉🎉
          <div class='buttons-div'>
            <button class='buttons' id='play-again-button'>
            Play
            </button>
            <button class='buttons' id='exit-game-button'>
            Exit
            </button>
          </div>
        </div>
      </main>
    </div>
`
/**
 * This is a base class for all applications.
 * All applications will have the same looks and structure.
 */
export class App extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.append(template.content.cloneNode(true))
    this.exitButton = this.shadow.querySelector('.exit')
    this.minimizeButton = this.shadow.querySelector('.minimize')
    this.maximizeButton = this.shadow.querySelector('.maximize')
    this.header = this.shadow.querySelector('header')
    this.username = null
    this.miniApp = null
  }

  /**
   * Checks if there are any applications open of a specific type.
   * This is used to determine if the section showing the open applications should open or not.
   */
  checkExists () {
    let exists = false
    for (let i = 0; i < getMaxId(); i++) {
      if (applications[i]) {
        if (applications[i].type === this.title) {
          exists = true
        }
      }
    }
    if (!exists) {
      const label = document.getElementById(this.title).shadowRoot.querySelector('.minimize-label')
      label.style.display = 'none'
    }
  }

  createMiniApp (element) {
    this.miniApp = document.createElement('mini-app')
    this.miniApp.id = `mini-${element.id}`
    return this.miniApp
  }

  connectedCallback () {
    const mainDiv = this.shadow.querySelector('.main-div')
    const img = this.shadowRoot.querySelector('.icon')
    img.src = `/img/${this.title.split('-')[0]}.png` // Set the application icon

    // Exits the application and removes the "mini application"
    this.exitButton.addEventListener('click', () => {
      delete applications[this.id]
      this.remove()
      this.checkExists()
      document.getElementById(`mini-${this.id}`).parentNode.remove()
    })

    this.minimizeButton.addEventListener('click', () => this.minimizeApp())

    let newX = 0; let newY = 0; let startX = 0; let startY = 0
    /**
     * Drag Move handler for moving the application window around
     * @param {*} ev The event.
     */
    const dragMoveEventHandler = (ev) => {
      newX = startX - ev.clientX
      newY = startY - ev.clientY

      startX = ev.clientX
      startY = ev.clientY

      mainDiv.style.top = `${mainDiv.offsetTop - newY}px`
      mainDiv.style.left = `${mainDiv.offsetLeft - newX}px`
    }

    /**
     * Drag end handler for placing the application where it is droppet after moving around.
     * @param {*} ev The event.
     */
    const dragEndEventHandler = (ev) => {
      document.removeEventListener('mousemove', dragMoveEventHandler)
      mainDiv.style.boxShadow = ''
    }

    /**
     * Drag start handler for starting the dragging event.
     * Focuses the current application and places it over the others.
     * A common Z-Index counter is used to place it above the others.
     * @param {*} ev The event.
     */
    const dragStartEventHandler = (ev) => {
      if (ev.target === this.header) {
        mainDiv.focus()
        mainDiv.style.zIndex = getZIndex()
        mainDiv.style.boxShadow = '0 0 5px 5px rgba(0,0,0,0.3)'
        startX = ev.clientX
        startY = ev.clientY
        document.addEventListener('mousemove', dragMoveEventHandler)
        document.addEventListener('mouseup', dragEndEventHandler)
      }
    }
    mainDiv.addEventListener('mousedown', dragStartEventHandler)
  }

  /**
   * Minimizes the application.
   * Adds it to the minimized applications array
   */
  minimizeApp () {
    const app = document.getElementById(this.id)
    if (!app) return
    app.style.display = 'none'
    applications[this.id] = { minimized: true, type: app.title }
  }

  /**
   * Decides where the window showing the open applications should be.
   * This is based on where the icon for the corresponding application is.
   * @param {*} element The element which the applications window is for, "chat-app", "memory-app", "game-app"
   */
  positionOpenApplications (element) {
    const type = element.title.split('-')[0]
    const chatIcon = document.getElementById(element.title)
    const rect = chatIcon.getBoundingClientRect()
    const testDiv = document.getElementById(`${type}-applications`)
    testDiv.style.top = `${window.scrollY + rect.top - 340}px`
    testDiv.style.left = `${window.scrollX + rect.left - 140}px`
  }
}

// Define the applications
customElements.define('app-window', App)
