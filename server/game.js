const { random, floor } = Math;
const INITIAL_STATE = {
  count: 0,
  correct: 0,
  colors: [],
  color: [],
  isGameOver: false,
  maxQuestions: 3,
  countdown: 5,
};

class Game {
  constructor(session) {
    this.session = session;
    this.state = {};
    this.reset();
    this.broadcastGameState();

    const interval = setInterval(() => {
      this.setState({
        countdown: this.state.countdown > 0 ? this.state.countdown - 1 : 0,
      });
    }, 1000);
  }

  broadcastGameState() {
    const clients = [...this.session.clients];
    clients.forEach((client) => {
      client.send({
        type: 'game-state',
        state: this.state,
      });
    });
  }

  checkAnswer(index) {
    if (index === this.state.colors.indexOf(this.state.color)) {
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
          ...this.getQuestion(),
        });
      }
    } else {
      this.setState({ count: this.state.count + 1 });
    }
  }

  getQuestion() {
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
    this.setState(this.getQuestion());
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.broadcastGameState(this.session);
  }
}

module.exports = Game;
