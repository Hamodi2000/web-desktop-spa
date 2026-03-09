import { App } from './App'
const template = document.createElement('template')
template.innerHTML = `
  <style>
    .main-div main {
      background-color: rgb(218, 218, 218);
      border-radius: 0 0 10px 10px;
    }

    #game-container {
      width: 300px;
      height: 358px;
      overflow-x: hidden;
      overflow-y: hidden;
      border: 2px solid white;
      border-radius: 0 0 10px 10px;  
    }

    #game-canvas {
      display: flex;
      height: 300px;
      width: 600px;
      background-color: #333;
      margin: 45px 20px 0px 20px;
    }

  </style>

    <div id='game-container'>
      <canvas id='game-canvas'>

      </canvas>
    </div>


`
/**
 * A maze game using canvas
 */
class GameApp extends App {
  constructor () {
    super()
    this.shadowRoot.append(template.content.cloneNode(true))
  }

  connectedCallback () {
    super.connectedCallback()
    const maximize = this.shadow.querySelector('.maximize')
    const settings = this.shadow.querySelector('.settings')
    maximize.remove()
    settings.remove()

    this.main = this.shadowRoot.querySelector('.main-div main')
    this.mainDiv = this.shadowRoot.querySelector('.main-div')
    this.gameContainer = this.shadowRoot.getElementById('game-container') // game container, holds the canvas
    this.gameCanvas = this.shadowRoot.getElementById('game-canvas') // game canvas
    this.ctx = this.gameCanvas.getContext('2d') // Creating a 2d game
    this.miniApp = null
    this.miniMain = null
    this.gameCanvas.width = this.gameCanvas.offsetWidth // Set the width
    this.gameCanvas.height = this.gameCanvas.offsetHeight // Set the height, otherwise it will be stretched.
    this.main.appendChild(this.gameContainer) // Append the game container to the main body.
    const playAgainButton = this.shadowRoot.getElementById('play-again-button')
    const exitGameButton = this.shadowRoot.getElementById('exit-game-button')

    exitGameButton.addEventListener('click', () => {
      this.exitButton.click()
    })

    super.positionOpenApplications(this)
    const tileSize = 15 // Size of each tile in the grid

    // An array to create the maze, 1's are walls and 0's can be walked on
    // Different mazes can be created to increase the difficulty.
    const maze = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]

    const rowLength = Object.keys(maze).length // Number of arrays
    const colLength = Object.keys(maze[0]).length // Number of elements in the arrays

    // Set the game size
    const gameSize = { rows: rowLength, cols: colLength }
    let player = { x: 1, y: 1, size: tileSize } // Starting position and size of the player.
    const goal = { x: colLength - 2, y: rowLength - 2 } // Goal position

    /**
     * This is used to move the canvas when the player reaches the wall of the container
     * Instead of showing the whole maze, a smaller portion is shown.
     * @param {*} way Is in which direction the player is going.
     */
    const checkBorder = (way) => {
      const rect = this.gameContainer.getBoundingClientRect()
      const rightPadding = player.size * (10 + player.x) // Length to the right wall
      const leftPadding = rect.left + (player.size * 4) // Length to the left wall
      const canvasRect = this.gameCanvas.getBoundingClientRect() // Size and position of the canvas
      const currentLeft = parseInt(window.getComputedStyle(this.gameCanvas).left || 0, 10) // Current left position of the canvas.
      switch (way) {
        // If players gets to close to the right wall, move canvas to the left.
        case 'right':
          if (rightPadding > 354 && rect.right <= canvasRect.right) {
            console.log('test')
            this.gameCanvas.style.left = `${currentLeft - player.size}px`
          }
          break
        // If players gets to close to the left wall, move canvas to the right.
        case 'left':
          if (leftPadding > 100 && rect.left > canvasRect.left) {
            if (rect.left + 10 <= rect.right) {
              this.gameCanvas.style.left = `${currentLeft + player.size}px`
            }
          }
          break
        default:
          break
      }
    }

    /**
     * Draws the maze from the array created.
     * Color the walls black, the road blueish and the goal yellow.
     */
    const drawMaze = () => {
      for (let row = 0; row < gameSize.rows; row++) {
        for (let col = 0; col < gameSize.cols; col++) {
          if (maze[row][col] === 0) {
            this.ctx.fillStyle = 'rgb(124, 198, 254)'
            this.ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize) // x and y position of the tile and the width and height
          } else if (maze[row][col] === 1) {
            this.ctx.fillStyle = 'black'
            this.ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize)
          } else if (maze[row][col] === 2) {
            this.ctx.fillStyle = 'yellow'
            this.ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize)
          }
        }
      }
    }

    /**
     * Draws the player as a blue circle on the map
     */
    const drawPlayer = () => {
      const radius = 8
      const startAngle = 0
      const endAngle = 2 * Math.PI
      this.ctx.beginPath()
      this.ctx.arc(player.x * tileSize + radius, player.y * tileSize + radius, radius, startAngle, endAngle) // Size of the player
      this.ctx.fillStyle = 'blue' // color of the player.
      this.ctx.fill()
      this.ctx.lineWidth = 2 // Border width
      this.ctx.strokeStyle = 'black' // border color
      this.ctx.stroke()
    }

    // Create a mini application of this type.
    this.miniApp = super.createMiniApp(this)

    /**
     * Moves the player on the map to the new x and y coordinates
     * @param {*} dx The new x step
     * @param {*} dy The new y step
     */
    const movePlayer = (dx, dy) => {
      const newX = player.x + dx // New x position
      const newY = player.y + dy // New y position

      // Check if player hits the wall
      if (maze[newY] && maze[newY][newX] !== 1) {
        player.x = newX // Set player x coordinate
        player.y = newY // Set player y coordinate

        // Checks if the player hits the border
        if (dx > 0) {
          checkBorder('right')
        } else if (dx < 0) {
          checkBorder('left')
        }

        // Check if the player reaches the goal
        if (player.x === goal.x && player.y === goal.y) {
          // Set timeout and display a win message.
          // Reset the game
          setTimeout(() => {
            this.mainDiv.style.pointerEvents = 'none'
            const winDiv = this.shadowRoot.querySelector('.win-div')
            winDiv.style.display = 'block'
            winDiv.style.zIndex = '5'
            winDiv.style.pointerEvents = 'auto'
            this.miniMain.innerHTML = this.main.innerHTML
            resetGame()
          }, 300)
        }
      }
      // Update the mini application with live updates of the player movement

      this.miniMain.innerHTML = this.main.innerHTML
      renderGame()
    }

    /**
     * Resets the game. Moves the player to the starting position.
     */
    const resetGame = () => {
      player = { x: 1, y: 1, size: tileSize }
      renderGame()
    }

    // Set the application id and the content after the maze is drawn.
    this.miniApp.createMiniApp(this)
    this.miniMain = this.miniApp.shadowRoot.querySelector('.main-div main')
    /**
     * Renders the game. Clears the canvas and draws the maze from the beginning
     * This is done on every player move. Almost like a game loop in game engines.
     */
    const renderGame = () => {
      this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
      drawMaze()
      drawPlayer()
      // Update the mini application
      const miniCanvas = this.miniApp.shadowRoot.getElementById('game-canvas')
      const miniCtx = miniCanvas.getContext('2d')
      miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height)
      miniCtx.drawImage(this.gameCanvas, 0, 0)
    }

    playAgainButton.addEventListener('click', () => {
      this.mainDiv.style.pointerEvents = 'auto'
      const winDiv = this.shadowRoot.querySelector('.win-div')
      winDiv.style.display = 'none'
      this.miniMain.innerHTML = this.main.innerHTML
      this.gameCanvas.focus()
      this.gameCanvas.style.left = '0'
      resetGame()
    })

    this.gameCanvas.setAttribute('tabindex', '0')
    this.gameCanvas.focus()

    // Listen for key presses from the player to move.
    this.shadowRoot.getElementById('game-canvas').addEventListener('keydown', (ev) => {
      this.gameCanvas.style.position = 'relative'

      switch (ev.key) {
        case 'ArrowUp':
          movePlayer(0, -1) // Move up
          break
        case 'ArrowDown':
          movePlayer(0, 1) // Move down
          break
        case 'ArrowLeft':
          movePlayer(-1, 0) // Move left
          break
        case 'ArrowRight':
          movePlayer(1, 0) // Mofe right
          break
        default:
          break
      }
    })

    renderGame()
  }
}

customElements.define('game-app', GameApp)
