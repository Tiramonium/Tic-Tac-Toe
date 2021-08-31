import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={(props.isWinner === true ? "winner " : props.isWinner === null ? "drawn " : "") + "square"} onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isWinner) {
        return <Square key={i} value={this.props.squares[i]} isWinner={isWinner} onClick={() => this.props.onClick(i)} />;
    }

    render() {
        const rows = [0, 1, 2];
        const cols = [0, 1, 2];

        return (
            <div>
                {
                    rows.map((row) => (
                        <div key={row} className="board-row">
                            {
                                cols.map((col) => {
                                    let i = row * cols.length + col;
                                    let isWinner;

                                    if (Array.isArray(this.props.resultMatch) && this.props.resultMatch.indexOf(i) > -1) {
                                        isWinner = true;
                                    } else if (this.props.resultMatch === 'draw') {
                                        isWinner = null;
                                    } else {
                                        isWinner = false;
                                    }

                                    return this.renderSquare(i, isWinner);
                                })
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            moveHistory: [null],
            ascend: true,
            stepNumber: 0,
            xIsNext: true
        };
    }

    render() {
        const moveHistory = this.state.moveHistory;
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const resultMatch = CalculateWinner(current.squares);
        const ascend = this.state.ascend;

        const moveOrder = ascend ? Object.keys(history) : Object.keys(history).reverse();

        const moves = moveOrder.map((move) => {
            const col = move > 0 ? Math.ceil(moveHistory[move] % 3) + 1 : '';
            const row = move > 0 ? parseInt(moveHistory[move] / 3) + 1 : '';
            const desc = move > 0 ? 'Go to move #' + move + ' (' + row + ', ' + col + ')' : 'Go to game start';

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} className={move === this.state.stepNumber ? 'active' : ''}>{desc}</button>
                </li>
            );
        });

        let status;

        if (Array.isArray(resultMatch)) {
            status = 'Winner: ' + current.squares[resultMatch[0]];
        } else if (resultMatch === 'draw') {
            status = 'Match ended in a draw';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares} resultMatch={resultMatch} onClick={(i) => this.handleClick(i)} />
                </div>
                <div className="game-info">
                    <div>{status}</div><br />
                    <button style={{ display: 'inline', marginLeft: '2em', marginRight: '4em' }} onClick={() => this.ascendMoves()}>⬆️</button>
                    <button style={{ display: 'inline-block' }} onClick={() => this.descendMoves()}>⬇️</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    handleClick(i) {
        const moveHistory = this.state.moveHistory.slice(0, this.state.stepNumber + 1);
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (CalculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{ squares: squares }]),
            moveHistory: moveHistory.concat([i]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    ascendMoves() {
        this.setState({
            ascend: true
        });
    }

    descendMoves() {
        this.setState({
            ascend: false
        });
    }
}

function CalculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [a, b, c];
        }
    }

    let result = 'draw';

    squares.forEach((square) => {
        if (square == null) {
            result = null;
        }
    });

    return result;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);