export interface PlaygroundGame {
  title: string;
  /** The Angular component selector rendered inside the modal for this game. */
  selector: string;
}

export const GAMES: PlaygroundGame[] = [
  { title: 'Paint', selector: 'app-paint' },
  { title: 'Whack-a-Bug', selector: 'app-whack-a-bug' },
  { title: 'Tic-Tac-Toe', selector: 'app-tic-tac-toe' },
  { title: 'Ball Catch', selector: 'app-ball-catch' },
  { title: 'Snake', selector: 'app-snake' },
  { title: 'Snowman', selector: 'app-snowman' },
];
