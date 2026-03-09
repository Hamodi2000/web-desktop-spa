import { App } from './App'
import { MiniApp } from './MiniApp'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    .main-div main {
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      height: 320px;
      padding-bottom: 5px;
      overflow-y: auto;
    }

    .text-button {
      display: flex;
      position: absolute;
      bottom: 5px;
      left: 5px;
      align-items: center;
      background-color: white;
      border-radius: 5px;
      margin: 0 auto;
      gap: 10px;
    }

    .message-area {
      position: relative;
      display: inline;    
      width: 250px;
      height: 30px;
      border: solid 0;
      resize: none;
      outline: none;
      border-radius: 5px;
      font-family: sarif;
      font-size: 14px
    }

    .emojis {
      position: relative;
      width: 20px;
      height: 20px;
      right: 8px;
      cursor: pointer;
    }

    .message {
      height: auto;
      width: 130px;
      background-color:rgb(10, 149, 255);
      box-shadow: 0 0 2px 2px rgba(0,0,0,0.3);
      padding: 5px 5px 5px 8px;
      color: black;
      word-wrap: break-word;
    }

    #received-message {
      align-self: flex-start;
      margin: 5px 0 0 5px;
      left: 0;
      border-radius: 20px 20px 20px 2px;
    }

    #sent-message {
      align-self: flex-end;
      margin: 5px 5px 0 0;
      right: 0;
      border-radius: 20px 20px 2px 20px;
    }
    
    .footer-div {
      position: relative;
      display: flex;
      background-color: rgb(218, 218, 218);
      border-radius: 0 0 10px 10px;
      height: 40px;
    }

    .emoji-div {
      display: none;
      position: absolute;
      flex-wrap: wrap;
      z-index = 1;
      height: 150px;
      width: 120px;
      background-color: white;
      bottom: 10px;
      right: 20px;
      border-radius: 5px;
      padding: 3px;
      overflow-y: auto;
    }

    .emoji {
      display: inline;
      width: 20px;
      height: 20px;
      margin: 2px;
      margin-right: 4px;
      text-align: center;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .name-label {
      display: block;
      width: 130px;
      max-width: 100%;
      height: auto;
      font-size: 12px;
      font-weight: bold;
      word-wrap: break-word;
      overflow-wrap: break-word
      white-space: normal;
      padding-left: 10px
    }

  </style>

`
/**
 * A chat application that connects to a websocket.
 */
class ChatApp extends App {
  constructor () {
    super()
    this.shadowRoot.append(template.content.cloneNode(true))
    this.socket = null
  }

  connectedCallback () {
    super.connectedCallback()
    const mainDiv = this.shadowRoot.querySelector('.main-div')
    const settingsDiv = this.shadow.getElementById('settings-div')
    const defaultUsername = 'anonymous' // Default name
    const defaultServer = 'my, not so secret, channel' // Default server
    this.messages = JSON.parse(localStorage.getItem('messages')) // Cached messages
    this.mini = MiniApp
    const main = this.shadowRoot.querySelector('.main-div main') // Main section for messages
    const emojisDiv = document.createElement('div') // Emoji section
    emojisDiv.className = 'emoji-div'
    const textDiv = document.createElement('div') // Div for textarea and emoji image.
    const textArea = document.createElement('textarea') // Text area for sending messages
    main.appendChild(emojisDiv)

    // Add classnames, placeholders and append the elements to the application
    textDiv.className = 'text-button'
    textArea.placeholder = 'Type a message...'
    textArea.className = 'message-area'
    const emojiImage = document.createElement('img')
    emojiImage.className = 'emojis'
    emojiImage.src = '/img/emojis.png'
    textDiv.append(textArea, emojiImage)
    const footerDiv = document.createElement('div')
    footerDiv.className = 'footer-div'
    footerDiv.appendChild(textDiv)
    mainDiv.append(footerDiv)

    // Create a mini application of this type.
    const miniApp = super.createMiniApp(this)
    miniApp.createMiniApp(this)
    const miniMain = miniApp.shadowRoot.querySelector('.main-div main')
    super.positionOpenApplications(this)

    // Fill the emoji section with emojis.
    this.addEmojis()
    // Gets the username and channel from localstorage if it exists
    const currentUsername = localStorage.getItem('username')
    const currentServer = localStorage.getItem('server')
    if (!currentUsername) {
      localStorage.setItem('username', defaultUsername) // Set default username
      this.username = defaultUsername
    } else { // Set current username.
      this.username = currentUsername
    }
    if (!currentServer) {
      localStorage.setItem('server', defaultServer) // Set default server
      this.server = defaultServer
    } else { // Set current server.
      this.server = currentServer
    }

    this.shadow.querySelector('.username-label').textContent = this.username // Display username
    this.shadow.querySelector('.server-label').textContent = this.server // Display server

    /**
     * Scrolls to the bottom
     */
    const scrollToBottom = () => {
      main.scrollTop = main.scrollHeight
    }

    /**
     * Creates a message and appends it to the main section.
     * @param {*} data is the message data
     * @param {*} user is the user that sent the message
     * @param {*} server is the server that the message is sent to
     * @param {*} type is the type of message
     */
    const createMessage = (data, user, server, type) => {
      const fullMessage = document.createElement('div')
      const receivedMessage = document.createElement('div') // Message content
      const nameLabel = document.createElement('label') // Username
      nameLabel.className = 'name-label'
      nameLabel.textContent = user
      receivedMessage.className = 'message'
      fullMessage.className = 'fullmessage'
      fullMessage.append(nameLabel, receivedMessage)
      receivedMessage.textContent += data // Add the message content to the div

      // Checks if the messages sent was from you or from someone other.
      // Puts the messages on the left or right, depending on who sent it.
      if (user === this.username) {
        receivedMessage.id = 'sent-message'
        fullMessage.id = 'sent-message'
        nameLabel.id = 'sent-message'
      } else {
        receivedMessage.id = 'received-message'
        fullMessage.id = 'received-message'
        nameLabel.id = 'received-message'
      }

      // Check if it is an actual message or if it is the server.
      if (type !== 'notification' && type !== 'heartbeat') {
        main.appendChild(fullMessage)
        const clonedMessage = fullMessage.cloneNode(true) // Clone message to mini application
        miniMain.appendChild(clonedMessage)
      }
      scrollToBottom()
    }

    /**
     * Empties the main of all messages.
     */
    const removeAllMessages = () => {
      const children = Array.from(main.children)
      const miniChildren = Array.from(miniMain.children)

      children.forEach(message => {
        if (message.className === 'fullmessage') {
          main.removeChild(message)
        }
      })

      miniChildren.forEach(message => {
        if (message.className === 'fullmessage') {
          miniMain.removeChild(message)
        }
      })
    }

    /**
     * Shows all the cached messages in the main section.
     */
    const showAllMessages = () => {
      removeAllMessages()
      if (this.messages === null) {
        this.messages = []
        localStorage.setItem('messages', JSON.stringify(this.messages))
      } else {
        this.messages.forEach(element => {
          if (element.server === this.server) {
            createMessage(element.message, element.user, element.server)
          }
        })
      }
    }

    /**
     * Show all messages when the app starts.
     */
    showAllMessages()
    let max = false
    let min = true

    const settings = this.shadow.querySelector('.settings') // Settings icon
    /**
     * Shows the settings when the icon is clicked.
     */
    const showSettings = () => {
      settingsDiv.style.display = 'block'
      mainDiv.style.pointerEvents = 'none'
      settingsDiv.style.pointerEvents = 'auto'
      this.shadow.querySelector('.username-label').textContent = localStorage.getItem('username')
    }
    settings.addEventListener('click', showSettings) // Event listener for settings.

    const saveButton = this.shadow.getElementById('save-button')
    const exitSettings = this.shadow.getElementById('exit-button')
    const usernameInput = this.shadow.getElementById('username')
    const serverInput = this.shadow.getElementById('server')

    /**
     * Saves the username when a user chooses their username.
     */
    const saveUser = () => {
      const localUsername = localStorage.getItem('username') // Get current username
      const localServer = localStorage.getItem('server') // Get current server
      // Check if user entered a new username
      if (usernameInput.value === '') {
        this.username = localUsername
      } else {
        this.username = usernameInput.value
      }
      // Check if user entered a new channel
      if (serverInput.value === '') {
        this.server = localServer
      } else {
        this.server = serverInput.value
      }
      usernameInput.value = '' // Empty input field
      serverInput.value = '' // Empty input field
      localStorage.setItem('server', this.server) // Add server to storage
      localStorage.setItem('username', this.username) // Add username to storage

      settingsDiv.style.display = 'none'
      this.shadow.querySelector('.username-label').textContent = localStorage.getItem('username')
      this.shadow.querySelector('.server-label').textContent = localStorage.getItem('server')
      mainDiv.style.pointerEvents = 'auto'
      showAllMessages()
    }

    saveButton.addEventListener('click', saveUser) // Event listener for saving the username

    // Event listener to exit settings.
    exitSettings.addEventListener('click', () => {
      if (this.username !== 'none') {
        settingsDiv.style.display = 'none'
        mainDiv.style.pointerEvents = 'auto'
      }
    })

    // Enter can be used to send the username chosen.
    usernameInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        saveUser()
      }
    })

    // Enter can be used to send the username chosen.
    serverInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        saveUser()
      }
    })

    // Update the mini application with live updates of the text input of the user.
    const updateMini = () => {
      const miniTextArea = miniApp.shadowRoot.querySelector('.message-area')
      miniTextArea.value = textArea.value
    }

    // Listen for user input in the text area.
    textArea.addEventListener('input', () => {
      updateMini()
    })

    // Displays the emoji section when the user clicks on the emoji.
    emojiImage.addEventListener('click', () => {
      if (!emojisDiv.style.display || emojisDiv.style.display === 'none') {
        emojisDiv.style.display = 'flex'
      } else {
        emojisDiv.style.display = 'none'
      }
    })

    // Listens for clicks on the emoji section
    // User can click on emojis to send them.
    emojisDiv.addEventListener('click', (ev) => {
      if (ev.target.className === 'emoji') {
        textArea.value += ev.target.textContent // Add to the end of text
        const textLength = textArea.value.length
        textArea.setSelectionRange(textLength, textLength) // Put cursor to the end of text.
      }
      textArea.focus() // Focus area so that user can continue to type.
    })

    const originalTextAreaWidth = textArea.offsetWidth
    // Users can maximize the chat application to a slightly bigger size.
    // Still a work in progress since the messages should be bigger.
    // Doubles the size of the application
    this.maximizeButton.addEventListener('click', () => {
      if (min) {
        main.style.height = `${main.offsetHeight * 2}px`
        main.style.width = `${main.offsetWidth * 2}px`
        textArea.style.width = `${originalTextAreaWidth * 2}px`
        emojisDiv.style.right = '65px'
        max = true
        min = false
      } else if (max) {
        main.style.height = `${main.offsetHeight / 2}px`
        main.style.width = `${main.offsetWidth / 2}px`
        textArea.style.width = `${originalTextAreaWidth}px`
        emojisDiv.style.right = '20px'
        min = true
        max = false
      }
    })

    // Open a web socket to listen for incoming messages.
    this.socket = new WebSocket('wss://courselab.lnu.se/message-app/socket')
    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket is open!')
    })

    // Listen for messages on the web socket
    this.socket.addEventListener('message', (event) => {
      // Section for username and messages
      const jsonData = JSON.parse(event.data) // Parse the data with JSON
      if (jsonData.channel === this.server) {
        createMessage(jsonData.data, jsonData.username, jsonData.channel, jsonData.type)
      }
      if (jsonData.username !== 'The Server') {
        this.messages.push({ message: jsonData.data, user: jsonData.username, server: jsonData.channel })
        localStorage.setItem('messages', JSON.stringify(this.messages))
      }
      console.log(event.data)
    })

    // Send the message if user presses enter
    // Create a new line if shift+enter is pressed.
    textArea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        if (ev.shiftKey) {
          return
        }

        ev.preventDefault()
        // Construct the message in JSON format.
        const message = {
          type: 'message',
          data: textArea.value,
          username: `${this.username}`,
          channel: this.server,
          key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
        }
        this.socket.send(JSON.stringify(message)) // Send the message
        textArea.value = ''
        emojisDiv.style.display = 'none'
      }
    })
  }

  // Codes for different emojis
  addEmojis = () => {
    const emojis = [
      128512, 128513, 128514, 128515, 128516, 128517,
      128518, 128519, 128520, 128521, 128522, 128523,
      128524, 128525, 128526, 128527, 128528, 128529,
      128530, 128531, 128532, 128533, 128534, 128535,
      128536, 128537, 128538, 128539, 128540, 128541,
      128542, 128543, 128544, 128545, 128546, 128547,
      128548, 128549
    ]

    // Create the emojis from the array of codes
    // Append to the emoji section.
    emojis.forEach(element => {
      const emoji = document.createElement('div')
      emoji.className = 'emoji'
      emoji.textContent = String.fromCodePoint(element)
      this.shadowRoot.querySelector('.emoji-div').appendChild(emoji)
    })
  }

  // Close the socket when done.
  disconnectedCallback () {
    if (this.socket) {
      this.socket.close()
    }
  }
}

customElements.define('chat-app', ChatApp)
