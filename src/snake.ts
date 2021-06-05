// idea for game - after button press snake randomly turns ? or continue moving
// another idea - remove three of the same color from snake
// add timer to get a fruit

let canvas = <HTMLCanvasElement>document.getElementById("ctx");
let ctx = canvas.getContext("2d");
let scoreDiv = <HTMLDivElement>document.getElementById("Score");

scoreDiv.innerText = "Click below on the game arena to start the game";

// game settings:
const gameSpeed = 100;
let failAtBounds = true;
let gamePaused = false;
const STEP = 15;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
let score: number = 0;
let intervalVar: number;

let gameInProgress = false;

const randColors = [
  "Silver",
  "Gray",
  "Black",
  "Red",
  "Maroon",
  "Yellow",
  "Olive",
  "Lime",
  "Green",
  "Aqua",
  "Teal",
  "Blue",
  "Navy",
  "Purple",
  "Orange",
];

// directions for a snake
enum directions {
  LEFT,
  UP,
  RIGHT,
  DOWN,
}
let direction: number = directions.RIGHT; //start moving to the right

class Snake {
  constructor(
    public x: number,
    public y: number,
    public isHead: boolean = false,
    public color: string = "green"
  ) {}
  height = 10;
  width = 10;

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width,
      this.y - this.height,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

let snakeList: Snake[] = [
  new Snake(220, 200, true, "red"),
  new Snake(210, 200),
  new Snake(200, 200),
]; // initial snek

const drawSnek = function (_sList: Snake[]) {
  for (let i = 0; i < _sList.length; i++) {
    _sList[i].draw(ctx);
  }
};

drawSnek(snakeList); //draws a very first snek

class Food {
  color: string;
  height = 10;
  width = 10;

  constructor(public x: number = 100, public y: number = 100) {
    const random = Math.floor(Math.random() * randColors.length);
    this.color = randColors[random];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width,
      this.y - this.height,
      this.width,
      this.height
    );
    ctx.restore();
  }
}
let food = new Food(); //draw a very first food
food.draw(ctx);

// var food = new Food();

// enum gameStatus {
//     START,
//     GAME,
//     PAUSE,
//     END,
//   }

document.getElementById("ctx").onmousedown = function () {
  if (!gameInProgress) {
    startGame();
    gameInProgress = true;
  }
};

document.onkeydown = function (event) {
  if (event.code == "Space") gamePaused = !gamePaused;
  // this function listens to the button press event and changes direction value

  // throw an error for internet explorer?
  // use buttons from html?

  if (
    event.code === "ArrowLeft" &&
    direction != directions.RIGHT &&
    !gamePaused
  )
    direction = directions.LEFT;
  else if (
    event.code == "ArrowUp" &&
    direction != directions.DOWN &&
    !gamePaused
  )
    direction = directions.UP;
  else if (
    event.code == "ArrowRight" &&
    direction != directions.LEFT &&
    !gamePaused
  )
    direction = directions.RIGHT;
  else if (
    event.code == "ArrowDown" &&
    direction != directions.UP &&
    !gamePaused
  )
    direction = directions.DOWN;
  //   else if (event.code == "Space") gamePaused = !gamePaused; //reverse pause condition
};

const testCollisionFood = function (snek: Snake, fruit: Food) {
  return (
    snek.x <= fruit.x + fruit.width &&
    fruit.x <= snek.x + snek.width &&
    snek.y <= fruit.y + fruit.height &&
    fruit.y <= snek.y + snek.height
  );
};

const testCollisionSnake = function (head: Snake, body: Snake) {
  //5 is a half of snake block
  return Math.abs(head.x - body.x) < 5 && Math.abs(head.y - body.y) < 5;
};

const moveSnek = function () {
  // this function creates new snake every time based on the head of snake

  for (let i = snakeList.length - 1; i >= 0; i--) {
    // we are parsing the whole list and updating

    if (i === 0) {
      // head is moving
      if (direction === directions.LEFT) {
        snakeList[i].x = snakeList[i].x - STEP;
      }
      if (direction === directions.UP) {
        snakeList[i].y = snakeList[i].y - STEP;
      }
      if (direction === directions.RIGHT) {
        snakeList[i].x = snakeList[i].x + STEP;
      }
      if (direction === directions.DOWN) {
        snakeList[i].y = snakeList[i].y + STEP;
      }
    } else {
      // the rest of body is shifting - following the head
      snakeList[i].x = snakeList[i - 1].x;
      snakeList[i].y = snakeList[i - 1].y;
    }
  }
};

const checkSnakePosition = function () {
  // so this is essentially lets snake head to go out of bounds

  if (failAtBounds) {
    if (
      snakeList[0].x > WIDTH ||
      snakeList[0].x < 0 ||
      snakeList[0].y > WIDTH ||
      snakeList[0].y < 0
    ) {
      endGame();
    }
  } else {
    if (snakeList[0].x > WIDTH) {
      snakeList[0].x = 0;
    }
    if (snakeList[0].y > HEIGHT) {
      snakeList[0].y = 0;
    }
    if (snakeList[0].x < 0) {
      snakeList[0].x = WIDTH;
    }
    if (snakeList[0].y < 0) {
      snakeList[0].y = HEIGHT;
    }
  }
};

const isGameOver = function () {
  for (let i = 1; i < snakeList.length; i++) {
    //   checks for every point of snake if it is in the vicinity of 5
    if (testCollisionSnake(snakeList[0], snakeList[i])) {
      endGame();
    }
  }
};

const endGame = function (): void {
  scoreDiv.innerText = `Game over. Final score: ${score}`;
  clearInterval(intervalVar);
  gameInProgress = false;
  score = 0; //reset the score
  snakeList = [
    new Snake(220, 200, true, "red"),
    new Snake(210, 200),
    new Snake(200, 200),
  ]; // re-initial snek
  return;
};

const updateSnakePosition = function () {
  // clear the whole game arena
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  //draw food
  food.draw(ctx); //gonna redraw current food after clearing the rectangle

  //draw snek
  drawSnek(snakeList);

  //check if snek ate fruit
  if (testCollisionFood(snakeList[0], food)) {
    score += 1;
    //feed snek - by adding one more chain to body
    snakeList.push(new Snake(0, 0, false, food.color));
    //create new fruit and place it anywhere from 0.1 to 0.9 width/height of canvas
    food = new Food(
      Math.random() * (0.9 * WIDTH - 0.1 * WIDTH) + 0.1 * WIDTH,
      Math.random() * (0.9 * HEIGHT - 0.1 * HEIGHT) + 0.1 * HEIGHT
    );
  }
  //check if snek has died
  isGameOver();

  //check if snek within bounds (we can make bounds deadly)
  checkSnakePosition();

  //move snek
  if (!gamePaused) {
    moveSnek();
  }

  //update score tableau
  if (gameInProgress) {
    scoreDiv.innerText = `Score: ${score}`;
  }
};

const startGame = function () {
  intervalVar = setInterval(updateSnakePosition, gameSpeed);
  console.log(`Game speed is ${gameSpeed}`);
};
