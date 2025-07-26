
from flask import Flask, render_template, jsonify, request
import json
import os
import re

app = Flask(__name__)

# 定数
EMPTY = 0
BLACK = 1
WHITE = 2

class GoGame:
    """
    囲碁のゲームロジックを管理するクラス。
    """
    def __init__(self, size=19, komi=6.5, handicap=0):
        if not 5 <= size <= 19:
            raise ValueError("盤のサイズは5から19の間でなければなりません。")
        self.size = size
        self.komi = komi
        self.handicap = handicap
        self.board = [[EMPTY for _ in range(size)] for _ in range(size)]
        self.turn = BLACK
        self.captures = {BLACK: 0, WHITE: 0}
        self.history = []
        self.ko_point = None
        self.consecutive_passes = 0
        self.game_over = False
        self.resigned_player = None

        if self.handicap > 0:
            self._setup_handicap()

    def _setup_handicap(self):
        """置き石を配置する"""
        if self.size not in [9, 13, 19] or self.handicap > 9:
            return
        points_map = {
            9: [(2, 2), (6, 6), (2, 6), (6, 2), (4, 4)],
            13: [(3, 3), (9, 9), (3, 9), (9, 3), (6, 6)],
            19: [(3, 3), (15, 15), (3, 15), (15, 3), (9, 9), (3, 9), (15, 9), (9, 3), (9, 15)]
        }
        handicap_points = points_map.get(self.size, [])
        if self.handicap > len(handicap_points):
            self.handicap = len(handicap_points)
        for i in range(self.handicap):
            x, y = handicap_points[i]
            self.board[y][x] = BLACK
        self.turn = WHITE

    def to_dict(self):
        """ゲームの状態を辞書形式で返す"""
        return {
            "size": self.size,
            "board": self.board,
            "turn": self.turn,
            "captures": self.captures,
            "komi": self.komi,
            "game_over": self.game_over,
            "resigned_player": self.resigned_player,
            "ko_point": self.ko_point,
            "consecutive_passes": self.consecutive_passes,
        }

    def _is_on_board(self, y, x):
        return 0 <= y < self.size and 0 <= x < self.size

    def _find_group(self, y, x):
        player = self.board[y][x]
        if player == EMPTY:
            return [], []
        q = [(y, x)]
        visited = set(q)
        group = []
        liberties = set()
        while q:
            cy, cx = q.pop(0)
            group.append((cy, cx))
            for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                ny, nx = cy + dy, cx + dx
                if self._is_on_board(ny, nx) and (ny, nx) not in visited:
                    visited.add((ny, nx))
                    neighbor = self.board[ny][nx]
                    if neighbor == EMPTY:
                        liberties.add((ny, nx))
                    elif neighbor == player:
                        q.append((ny, nx))
        return group, list(liberties)

    def _capture_stones(self, group):
        for y, x in group:
            self.board[y][x] = EMPTY
        captured_count = len(group)
        self.captures[self.turn] += captured_count
        return captured_count

    def is_valid_move(self, y, x, player):
        if not self._is_on_board(y, x):
            return False, "盤外です。"
        if self.board[y][x] != EMPTY:
            return False, "既に石があります。"
        if (y, x) == self.ko_point:
            return False, "コウのため着手できません。"
        
        original_board_state = [row[:] for row in self.board]
        self.board[y][x] = player
        
        opponent = WHITE if player == BLACK else BLACK
        captured_any = False
        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ny, nx = y + dy, x + dx
            if self._is_on_board(ny, nx) and self.board[ny][nx] == opponent:
                group, liberties = self._find_group(ny, nx)
                if not liberties:
                    captured_any = True
                    break
        
        group, liberties = self._find_group(y, x)
        self.board = original_board_state

        if not liberties and not captured_any:
            return False, "自殺手です。"
        return True, ""

    def place_stone(self, y, x):
        is_valid, reason = self.is_valid_move(y, x, self.turn)
        if not is_valid:
            return False, reason

        prev_state = self.to_dict()
        self.history.append(prev_state)

        self.board[y][x] = self.turn
        opponent = WHITE if self.turn == BLACK else BLACK
        total_captured = 0
        captured_group_for_ko = None

        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ny, nx = y + dy, x + dx
            if self._is_on_board(ny, nx) and self.board[ny][nx] == opponent:
                group, liberties = self._find_group(ny, nx)
                if not liberties:
                    captured_count = self._capture_stones(group)
                    total_captured += captured_count
                    if captured_count == 1:
                        captured_group_for_ko = group
        
        self.ko_point = None
        if total_captured == 1:
            my_group, my_liberties = self._find_group(y, x)
            if len(my_liberties) == 1 and my_liberties[0] == captured_group_for_ko[0]:
                 self.ko_point = captured_group_for_ko[0]

        self.consecutive_passes = 0
        self.turn = opponent
        return True, ""

    def pass_turn(self):
        self.consecutive_passes += 1
        self.turn = WHITE if self.turn == BLACK else BLACK
        if self.consecutive_passes >= 2:
            self.game_over = True
        
        prev_state = self.to_dict()
        prev_state['passed'] = True
        self.history.append(prev_state)
        return True

    def undo_move(self):
        if not self.history:
            return False
        last_state = self.history.pop()
        self.size = last_state['size']
        self.board = last_state['board']
        self.turn = last_state['turn']
        self.captures = last_state['captures']
        self.komi = last_state['komi']
        self.game_over = last_state['game_over']
        self.resigned_player = last_state['resigned_player']
        self.ko_point = last_state['ko_point']
        self.consecutive_passes = last_state['consecutive_passes']
        return True

    def resign(self):
        """投了する"""
        self.resigned_player = self.turn
        self.game_over = True
        return True

    def calculate_score(self):
        scores = {BLACK: 0, WHITE: 0}
        territory = {BLACK: 0, WHITE: 0}
        visited = set()

        for r in range(self.size):
            for c in range(self.size):
                if self.board[r][c] == EMPTY and (r, c) not in visited:
                    q = [(r, c)]
                    region = set(q)
                    visited.add((r, c))
                    touches_black = False
                    touches_white = False
                    while q:
                        cy, cx = q.pop(0)
                        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                            ny, nx = cy + dy, cx + dx
                            if self._is_on_board(ny, nx):
                                if self.board[ny][nx] == BLACK:
                                    touches_black = True
                                elif self.board[ny][nx] == WHITE:
                                    touches_white = True
                                elif (ny, nx) not in visited:
                                    visited.add((ny, nx))
                                    region.add((ny, nx))
                                    q.append((ny, nx))
                    if touches_black and not touches_white:
                        territory[BLACK] += len(region)
                    elif touches_white and not touches_black:
                        territory[WHITE] += len(region)

        scores[BLACK] = territory[BLACK] + self.captures[BLACK]
        scores[WHITE] = territory[WHITE] + self.captures[WHITE] + self.komi
        
        return {
            "territory": territory,
            "scores": scores
        }

# グローバルにゲームインスタンスを保持
game = GoGame()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/new_game", methods=['POST'])
def new_game():
    global game
    data = request.json
    size = data.get('size', 19)
    handicap = data.get('handicap', 0)
    game = GoGame(size=size, handicap=handicap)
    return jsonify(game.to_dict())

@app.route("/api/play", methods=['POST'])
def play():
    global game
    data = request.json
    y, x = data['y'], data['x']
    success, reason = game.place_stone(y, x)
    if success:
        return jsonify(game.to_dict())
    else:
        return jsonify({"error": reason, "state": game.to_dict()}), 400

@app.route("/api/pass", methods=['POST'])
def pass_turn():
    global game
    game.pass_turn()
    return jsonify(game.to_dict())

@app.route("/api/undo", methods=['POST'])
def undo():
    global game
    if game.undo_move():
        return jsonify(game.to_dict())
    else:
        return jsonify({"error": "No history to undo", "state": game.to_dict()}), 400

@app.route("/api/score", methods=['GET'])
def get_score():
    global game
    if not game.game_over:
        return jsonify({"error": "Game is not over yet."}), 400
    score_info = game.calculate_score()
    return jsonify({
        "state": game.to_dict(),
        "score_info": score_info
    })

@app.route("/api/resign", methods=['POST'])
def resign():
    global game
    game.resign()
    return jsonify(game.to_dict())

if __name__ == "__main__":
    app.run(debug=True)
