export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(random = Math.random) {
  const middle = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle },
  ];

  return {
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, random),
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function queueDirection(state, nextDirection) {
  if (!(nextDirection in DIRECTION_VECTORS)) {
    return state.direction;
  }

  const blockedDirection =
    state.snake.length > 1 ? OPPOSITE_DIRECTIONS[state.direction] : null;

  if (nextDirection === blockedDirection) {
    return state.pendingDirection;
  }

  return nextDirection;
}

export function stepGame(state, random = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.pendingDirection;
  const nextHead = getNextHead(state.snake[0], direction);
  const willEat = positionsMatch(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (hitsBoundary(nextHead) || bodyToCheck.some((segment) => positionsMatch(segment, nextHead))) {
    return {
      ...state,
      direction,
      gameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!willEat) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: willEat ? placeFood(nextSnake, random) : state.food,
    score: willEat ? state.score + 1 : state.score,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function placeFood(snake, random = Math.random) {
  const openCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);

      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function getNextHead(head, direction) {
  const vector = DIRECTION_VECTORS[direction];

  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
}

export function positionsMatch(a, b) {
  return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
}

function hitsBoundary(position) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= GRID_SIZE ||
    position.y >= GRID_SIZE
  );
}
