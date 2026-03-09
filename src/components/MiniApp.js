import { applications, getMaxId } from '../main'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    .mini-app {
      transform: scale(0.3);
      pointer-events: none;
      display: inline;
      position: absolute;
      margin: 5px;
    }
 
  </style>

  <div class='mini-app'>

  </div>
`
/**
 * Base class for mini applications
 */
export class MiniApp extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.append(template.content.cloneNode(true))
    this.exitMini = null
  }

  connectedCallback () {
    const parent = document.getElementById((this.id).split('-')[1])
    // Add listener to exit the mini application and the main one.
    this.exitMini.addEventListener('click', () => {
      parent.remove() // Remove the parent
      delete applications[parent.id] // Remove entry in the applications array
      this.parentElement.remove() // Remove this
      let exists = false
      // Check if any open applications exists
      // If applications do not exist, remove the label under the icon.
      for (let i = 0; i < getMaxId(); i++) {
        if (applications[i]) {
          if (applications[i].type === parent.title) {
            exists = true
          }
        }
      }
      if (!exists) {
        const label = document.getElementById(parent.title).shadowRoot.querySelector('.minimize-label')
        label.style.display = 'none'
      }
    })
  }

  /**
   * Creates a mini application from the parent and appends the innerHTML
   * @param {*} element The parent element which a mini application is created from
   */
  createMiniApp = (element) => {
    let applicationsApp = null
    const miniDiv = this.shadow.querySelector('.mini-app')
    miniDiv.innerHTML = element.shadowRoot.innerHTML
    this.shadow.querySelector('.tools').innerHTML = '' // Remove the tools on the mini app
    switch (element.title) {
      case 'chat-app': // Open chat application
        applicationsApp = document.getElementById('chat-applications')
        break
      case 'memory-app': // Open memory application
        applicationsApp = document.getElementById('memory-applications')
        break
      case 'game-app': // Open game application
        applicationsApp = document.getElementById('game-applications')
        break
      default:
        break
    }
    const applicationsDiv = applicationsApp.querySelector('.applications-div')
    const holder = document.createElement('div')
    holder.className = 'holder'
    holder.id = `holder${this.id}`
    const exitMini = document.createElement('img')
    exitMini.src = '/img/exit.png' // Exit button
    exitMini.className = 'exit-mini'
    this.exitMini = exitMini
    holder.append(this, exitMini)
    applicationsDiv.appendChild(holder)

    // Maximize the application if the mini application is clicked on.
    holder.addEventListener('click', (ev) => {
      if (ev.target !== exitMini) {
        const fullVersion = document.getElementById((this.id).split('-')[1])
        if (applications[fullVersion.id].minimized === true) {
          fullVersion.style.display = 'block'
        }
      }
    })
  }
}

customElements.define('mini-app', MiniApp)
