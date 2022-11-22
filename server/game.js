const { random, floor } = Math;
const INITIAL_STATE = {
  count: 0,
  correct: 0,
  colors: [],
  color: [],
  isGameOver: false,
  peers: [],
  maxQuestions: 3,
};

class Game {
  constructor(session) {
    this.session = session;
    this.state = {};
    this.reset();
  }

  broadcastGameState(session) {
    const clients = [...session.clients];
    clients.forEach((client) => {
      client.send({
        type: 'game-state',
        state: this.state,
      });
    });
  }

  checkAnswer(color) {
    if (color === this.state.color.toString()) {
      this.setState({
        count: this.state.count + 1,
        correct: this.state.correct + 1,
      });
      if (this.state.correct >= this.state.maxQuestions) {
        this.setState({
          isGameOver: true,
        });
      } else {
        this.setState({
          ...this.createQuestion(),
        });
      }
    } else {
      this.setState({ count: this.state.count + 1 });
    }
  }

  createQuestion() {
    const colors = [
      this.randomColorData(),
      this.randomColorData(),
      this.randomColorData(),
    ];
    const color = colors[floor(random() * colors.length)];
    return { colors, color };
  }

  randomColorData() {
    return [
      floor(random() * 360),
      floor(random() * 100),
      floor(random() * 100),
    ];
  }

  reset() {
    this.setState(INITIAL_STATE);
    this.setState(this.createQuestion());
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.broadcastGameState(this.session);
  }
}

module.exports = Game;
