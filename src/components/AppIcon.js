import { getAppId, applications, getMaxId } from '../main'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    img {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: block;
      margin-left: 5px;
      margin-top: 5px;
      margin-right: 5px;
      cursor: pointer;
      transition: transform 0.3s ease;

    }
    
    .minimize-label {
      display: none;
      position: fixed;
      background-color: rgb(185, 79, 79);
      width: 30px;
      height: 4px;
      border-radius: 10px;
      margin-left: 12px;
      margin-top: 3px;
    }

    img:hover {
      transform: scale(1.2);
    }

  </style>
  <div>
    <img class='icon' src="" alt="">
    <label class='minimize-label'> </label>
  </div>

`

/**
 * This is the base class for all applications icons that are shown in the bottom of the page.
 */
export class AppIcon extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.append(template.content.cloneNode(true))
  }

  connectedCallback () {
    const main = document.getElementById('main-body')
    // Set the icon for the application
    const img = this.shadowRoot.querySelector('.icon')
    // Get the title of the icon to be used when opening applications.
    if (this.hasAttribute('title')) {
      this.id = this.getAttribute('title')
      img.src = `/img/${this.title.split('-')[0]}.png`
    }

    /**
     * Body height of the application and the number of applications
     * To stack applications when opening multiple ones.
     * Offset is used to stack them downwards and sideways
     */
    let bodyHeight = 400
    let numberOfApplications = 0
    const maxHeight = window.innerHeight
    const offset = 50

    /**
     * Creates an application of the type, sets the id and appends it to the page.
     * @param {*} type Is the type of application to be opened
     * @returns {HTMLElement} The application that is created
     */
    const openApp = (type) => {
      numberOfApplications++
      const app = document.createElement(type)
      app.setAttribute('title', type)
      app.id = getAppId()
      applications[app.id] = { minimized: false, type: app.title }
      app.style.position = 'absolute'
      main.appendChild(app)

      // Calculates where it should be opened.
      const totalHeight = (bodyHeight * 0.2) * numberOfApplications
      if (totalHeight > maxHeight) {
        bodyHeight = 0
        numberOfApplications = 1
      } else {
        app.style.top = `${numberOfApplications * 40}px`
        app.style.left = `${numberOfApplications * offset}px`
      }
      return app
    }

    let openApplications = null
    // Event listener to open the application when the app icon is clicked on.
    img.addEventListener('click', () => {
      const openedApp = openApp(this.id)
      const icon = document.getElementById(openedApp.title)
      const label = icon.shadowRoot.querySelector('.minimize-label')
      label.style.display = 'flex'
      switch (this.id) {
        case 'chat-app':
          openApplications = document.getElementById('chat-applications')
          break
        case 'memory-app':
          openApplications = document.getElementById('memory-applications')
          break
        case 'game-app':
          openApplications = document.getElementById('game-applications')
          break
        default:
          break
      }
    })

    // Display open applications.
    const showOpenApps = () => {
      openApplications.style.display = 'grid'
    }

    let isHovering = false
    // Hide open applications
    const hideOpenApps = () => {
      if (!isHovering && openApplications) {
        openApplications.style.display = 'none'
      }
    }

    // Displays the current open applications when the app icon is hovered on.
    img.addEventListener('mouseover', () => {
      // Check if any applications are open.
      if (Object.keys(applications).length > 0) {
        let exists = false
        for (let i = 0; i < getMaxId(); i++) {
          if (applications[i]) {
            if (applications[i].type === this.id) {
              exists = true
            }
          }
        }
        // Display the current open applications
        if (openApplications) {
          if (exists === true) {
            isHovering = true
            showOpenApps()
            /**
             *  Add event listener on the opened window so that users can
             *  choose if they want to maximize a minimized app or if the want to exit.
             */

            openApplications.addEventListener('mouseover', () => {
              isHovering = true
            })

            openApplications.addEventListener('mouseout', () => {
              isHovering = false
              setTimeout(hideOpenApps, 200)
            })
          }
        }
      }
    })

    // Close the open applications if the mouse leaves the icon.
    img.addEventListener('mouseout', () => {
      if (Object.keys(applications).length > 0) {
        if (openApplications) {
          isHovering = false
          setTimeout(hideOpenApps, 200)
        }
      }
    })
  }

  static get observedAttributes () {
    return ['title']
  }
}

customElements.define('app-icon', AppIcon)
