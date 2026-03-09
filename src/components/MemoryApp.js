import { App } from './App'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    .main-div main {
      display: flex;
      flex-wrap: wrap;
      width: 300px;
      word-wrap: break-word;
      border-radius: 0 0 10px 10px;
      height: fit-content;
      outline: none;
    }

    .play-card {
      position: relative;
      display: inline;
      background-color: none;
      width: 60px;
      height: 80px;
      margin: 7px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow:  3px 3px rgba(0,0,0,0.2);
      transition: transform 0.7s;
      backface-visibility: visible;
    }

    .front-card {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      visibility: hidden;
      background-size: 60px 80px;
      transform-style: preserve-3d;
      transition: transform 0.5s;
        
    }

    .back-card {
      position: absolute;
      background-image: url(/img/card-background.jpeg);
      background-size: cover;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      transform-style: preserve-3d;
      transition: transform 0.7s;
      backface-visibility: visible;
    }
  </style>
`

const size = '4x4'

/**
 * A memory game
 */
class MemoryApp extends App {
  constructor () {
    super()
    this.shadowRoot.append(template.content.cloneNode(true))
  }

  connectedCallback () {
    super.connectedCallback()

    const main = this.shadowRoot.querySelector('.main-div main')
    const settings = this.shadow.querySelector('.settings')
    const maximize = this.shadow.querySelector('.maximize')
    main.setAttribute('tabindex', '0')
    maximize.remove() // Remove the maximize icon because it is not used, can be used in future
    settings.remove() // Remove the setting icon because it is not used, can be used in future.

    // Possible cards that are displayed in the game.
    const possibleCards = [
      'apple-monitor.png', 'apple-phone.png', 'camera.png', 'controller.png',
      'earphones.png', 'ipad.png', 'ipod.png', 'laptop.png',
      'memory-card.png', 'monitor-pc.png', 'monitor.png', 'nintendo.png', 'nokia-phone.png',
      'printer.png', 'small-printer.png'
    ]

    // Shuffle the array to randomly put out the cards.
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    // Initialize the mini application
    const miniApp = super.createMiniApp(this)
    miniApp.createMiniApp(this)
    const miniMain = miniApp.shadowRoot.querySelector('.main-div main')
    const winMessage = this.shadowRoot.querySelector('.win-div')

    /**
     * Add the cards to the main section of the application
     */
    const addCards = () => {
      main.innerHTML = ''
      main.appendChild(winMessage)
      const totalCards = size.split('x')[0] * size.split('x')[1] // Number of cards for the size of game (4x4)
      let newCardArray = shuffleArray(possibleCards).slice(0, totalCards / 2) // Shuffled cards enough for the game
      const secondCardArray = newCardArray.map(element => element + '(2)') // The other pair of the cards
      newCardArray = newCardArray.concat(secondCardArray) // The complete card array for the game
      let remainingCards = totalCards
      // Create cards and append them to the game.
      for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div') // Create div to hold the card
        card.className = 'play-card'
        const frontCard = document.createElement('div') // Create div for front-face
        frontCard.className = 'front-card'
        const backCard = document.createElement('div') // Create div for back-face
        backCard.className = 'back-card'

        card.append(frontCard, backCard) // Add both faces to the card
        const rand = Math.floor(Math.random() * (remainingCards - 1)) // Get random positions for the cards
        card.id = newCardArray[rand]
        newCardArray.splice(newCardArray.indexOf(newCardArray[rand]), 1) // Remove the placed card.
        remainingCards--
        main.appendChild(card) // Appends to the main section
      }
      miniMain.innerHTML = main.innerHTML // Update the mini application
    }
    addCards()

    super.positionOpenApplications(this)
    let processing = false
    /**
     * Flips the chosen card to show the object
     * Rotates the card when it is flipped
     * @param {*} card Is the card that is flipped
     */
    const flip = (card) => {
      const cardId = card.id.split('(')[0]
      const backCard = card.querySelector('.back-card')
      const frontCard = card.querySelector('.front-card')
      frontCard.style.transition = 'transform 0.5s'
      frontCard.style.transform = 'rotateY(-360deg)'
      backCard.style.transform = 'rotateY(180deg)'
      backCard.style.backfaceVisibility = 'hidden'
      card.style.transform = 'rotateY(180deg)'
      main.style.pointerEvents = 'none'
      processing = true
      setTimeout(() => {
        frontCard.style.backgroundImage = `url(/img/cards/${cardId})`
        frontCard.style.visibility = 'visible'
        backCard.style.visibility = 'hidden'
      }, 200)
    }

    /**
     * Flips back the card if it is not a correct pair.
     * @param {*} card Is the card that is flipped back.
     */
    const flipBack = (card) => {
      const backCard = card.querySelector('.back-card')
      const frontCard = card.querySelector('.front-card')
      frontCard.style.transform = 'rotateY(0deg)'
      backCard.style.transform = 'rotateY(0deg)'
      card.style.transform = 'rotateY(0deg)'
      frontCard.style.transition = 'transform 1.2s'
      main.style.pointerEvents = 'none'
      processing = true
      setTimeout(() => {
        backCard.style.visibility = 'visible'
        frontCard.style.visibility = 'hidden'
      }, 200)
    }

    /**
     * Removes the card from the game
     * @param {*} card The card that should get removed
     */
    const removeCard = (card) => {
      card.querySelector('.back-card').remove()
      card.querySelector('.front-card').remove()
      card.style.boxShadow = '0 0 0 0'
      card.style.pointerEvents = 'none'
    }

    const playAgainButton = this.shadowRoot.getElementById('play-again-button')
    const exitGameButton = this.shadowRoot.getElementById('exit-game-button')
    let children = Array.from(main.children) // Cards in the main game
    let miniChildren = Array.from(miniMain.children) // Cards in the mini game
    // Listener for the play again button. User can choose to play again.
    playAgainButton.addEventListener('click', () => {
      winMessage.style.display = 'none'
      addCards()
      children = Array.from(main.children)
      miniChildren = Array.from(miniMain.children)
      main.focus()
    })

    // Listener for the exit game button.
    exitGameButton.addEventListener('click', () => {
      this.exitButton.click()
    })

    /**
     * Checks if the user has won the game.
     * Checks if there are any cards left in the game.
     */
    const checkWin = () => {
      const cards = this.shadowRoot.querySelectorAll('.back-card')
      if (Object.keys(cards).length === 0) {
        main.appendChild(winMessage)
        winMessage.style.display = 'flex'
        const miniWinMessage = miniApp.shadowRoot.querySelector('.win-div')
        miniWinMessage.style.display = 'flex'
      }
    }

    let pair = []
    /**
     *  Checks if the user has chosen two cards
     *  Checks if the user has found a pair of cards.
     * @param {*} card The main card that the user chose
     * @param {*} childCard The same card but in the mini version for live updates.
     * @returns {boolean} true or false.
     */
    const checkIfPair = (card, childCard) => {
      flip(card) // Flip the main card
      flip(childCard) // Flip the child card
      const cardId = card.id
      main.style.pointerEvents = 'auto' // Disable pointer events so that the user cant choose multiple cards.
      processing = false
      pair.push(cardId)
      if (Object.keys(pair).length === 2) { // Check if the user has chosen two cards
        main.style.pointerEvents = 'none'
        processing = true
        const firstCard = this.shadowRoot.getElementById(pair[0]) // First card chosen
        const secondCard = this.shadowRoot.getElementById(`${pair[1]}`) // Second card chosen
        const miniFirstCard = miniApp.shadowRoot.getElementById(pair[0])
        const miniSecondCard = miniApp.shadowRoot.getElementById(`${pair[1]}`)
        // If the player has found a pair of cards
        if (pair[0].split('(')[0] === pair[1].split('(')[0]) {
          setTimeout(() => {
            // Remove the cards that was chosen (a pair)
            removeCard(firstCard)
            removeCard(secondCard)
            removeCard(miniFirstCard)
            removeCard(miniSecondCard)
            // Remove the cards from the array
            children.splice(children.indexOf(firstCard), 1)
            children.splice(children.indexOf(secondCard), 1)
            miniChildren.splice(miniChildren.indexOf(miniFirstCard), 1)
            miniChildren.splice(miniChildren.indexOf(miniSecondCard), 1)
            main.style.pointerEvents = 'auto'
            processing = false
            pair = []
            checkWin()
          }, 1500)
          return true
        } else {
          // Flip the cards back if they weren't a pair
          setTimeout(() => {
            flipBack(firstCard)
            flipBack(secondCard)
            flipBack(miniFirstCard)
            flipBack(miniSecondCard)
            main.style.pointerEvents = 'auto'
            processing = false
            pair = []
          }, 1500)
          return false
        }
      }
      return false
    }

    // Listen for click events on the main section
    // If the user clicks on a card, we show the chosen card.
    main.addEventListener('click', (ev) => {
      if (ev.target.className === 'back-card') {
        const parent = ev.target.parentNode
        const miniParent = miniApp.shadowRoot.getElementById(parent.id)
        const visible = parent.querySelector('.front-card').style.visibility
        if (visible === 'hidden' || visible === '') {
          checkIfPair(parent, miniParent)
        }
      }
    })

    /**
     * Gets the card from the array of cards (children of the main section)
     * @param {*} index The index of the card
     * @returns {HTMLElement | null} The card
     */
    const getChild = (index) => {
      if (index > 0) {
        return [children[index], miniChildren[index]]
      }
      return null
    }

    main.focus()
    let currentChild = null // Current chosen card
    let maxChild = 16 // Amount of children of the main section
    const minChild = 1 // Index 1 is the minimum since there is a "win div"
    let previous = null // Previous chosen card
    let checkPair = null
    // Listen for key events of the arrow keys
    // For accessability.
    main.addEventListener('keydown', (ev) => {
      maxChild = Object.keys(children).length - 1
      if (currentChild == null) { // If the player just started the game
        currentChild = 1 // The first card is marked
        previous = currentChild // The previous card is the current card
      } else {
        if (!processing) {
          switch (ev.key) {
            case 'ArrowLeft': // Listen for left movements
              previous = currentChild
              if (currentChild - 1 >= minChild) {
                currentChild = children.indexOf(children[currentChild - 1]) // Update current card
              }
              break
            case 'ArrowRight': // Listen for right movements
              previous = currentChild
              if (currentChild + 1 <= maxChild) {
                currentChild = children.indexOf(children[currentChild + 1]) // Update current card
              }
              break
            case 'Enter': // Listen for The enter key to select a card.
              checkPair = checkIfPair(getChild(currentChild)[0], getChild(currentChild)[1]) // Check if pair has been chosen.
              if (checkPair) {
                currentChild = 1 // If a pair has been found, start at the first card
                previous = 1
              }
              break
            default:
              break
          }
        }
      }
      // Change the box shadows of the cards to show the selected one.
      if (Object.keys(children).length > 1) {
        getChild(previous)[0].style.boxShadow = '3px 3px rgba(0,0,0,0.2)'
        getChild(previous)[1].style.boxShadow = '3px 3px rgba(0,0,0,0.2)'
        getChild(currentChild)[0].style.boxShadow = '0 0 5px 5px rgba(0,0,0, 0.4'
        getChild(currentChild)[1].style.boxShadow = '0 0 5px 5px rgba(0,0,0, 0.4'
      }
    })
  }
}

customElements.define('memory-app', MemoryApp)
