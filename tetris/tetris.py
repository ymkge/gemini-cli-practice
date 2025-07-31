import pygame
import random

# Pygameの初期化
pygame.init()
pygame.font.init()

# --- 定数 ---
# 画面サイズ
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 700
PLAY_WIDTH = 300  # 10ブロック x 30px
PLAY_HEIGHT = 600 # 20ブロック x 30px
BLOCK_SIZE = 30

# プレイエリアの左上の座標
TOP_LEFT_X = (SCREEN_WIDTH - PLAY_WIDTH) // 2
TOP_LEFT_Y = SCREEN_HEIGHT - PLAY_HEIGHT - 50

# --- 色 ---
BLACK = (18, 18, 18)
WHITE = (245, 245, 245)
GRAY = (40, 40, 40)
LIGHT_GRAY = (60, 60, 60)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)
PURPLE = (128, 0, 128)
RED = (255, 0, 0)

# --- テトリミノの形状 ---
S = [['.....',
      '.....',
      '..00.',
      '.00..',
      '.....'],
     ['.....',
      '..0..',
      '..00.',
      '...0.',
      '.....']]

Z = [['.....',
      '.....',
      '.00..',
      '..00.',
      '.....'],
     ['.....',
      '..0..',
      '.00..',
      '.0...',
      '.....']]

I = [['..0..',
      '..0..',
      '..0..',
      '..0..',
      '.....'],
     ['.....',
      '0000.',
      '.....',
      '.....',
      '.....']]

O = [['.....',
      '.....',
      '.00..',
      '.00..',
      '.....']]

J = [['.....',
      '.0...',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..00.',
      '..0..',
      '..0..',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '...0.',
      '.....'],
     ['.....',
      '..0..',
      '..0..',
      '.00..',
      '.....']]

L = [['.....',
      '...0.',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..0..',
      '..0..',
      '..00.',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '.0...',
      '.....'],
     ['.....',
      '.00..',
      '..0..',
      '..0..',
      '.....']]

T = [['.....',
      '..0..',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..0..',
      '..00.',
      '..0..',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '..0..',
      '.....'],
     ['.....',
      '..0..',
      '.00..',
      '..0..',
      '.....']]

# --- グローバル変数 ---
shapes = [S, Z, T, O, L, I, J]
shape_colors = [GREEN, RED, PURPLE, YELLOW, ORANGE, CYAN, BLUE]

# --- クラス ---
class Piece(object):
    def __init__(self, column, row, shape):
        self.x = column
        self.y = row
        self.shape = shape
        self.color = shape_colors[shapes.index(shape)]
        self.rotation = 0

# --- 関数 ---
def create_grid(locked_positions={}):
    grid = [[BLACK for _ in range(10)] for _ in range(20)]
    for y in range(len(grid)):
        for x in range(len(grid[y])):
            if (x, y) in locked_positions:
                grid[y][x] = locked_positions[(x, y)]
    return grid

def convert_shape_format(shape):
    positions = []
    format = shape.shape[shape.rotation % len(shape.shape)]
    for i, line in enumerate(format):
        row = list(line)
        for j, column in enumerate(row):
            if column == '0':
                positions.append((shape.x + j, shape.y + i))
    for i, pos in enumerate(positions):
        positions[i] = (pos[0] - 2, pos[1] - 4)
    return positions

def valid_space(shape, grid):
    accepted_positions = [[(j, i) for j in range(10) if grid[i][j] == BLACK] for i in range(20)]
    accepted_positions = [j for sub in accepted_positions for j in sub]
    formatted = convert_shape_format(shape)
    for pos in formatted:
        if pos not in accepted_positions:
            if pos[1] > -1:
                return False
    return True

def check_lost(positions):
    for pos in positions:
        _, y = pos
        if y < 1:
            return True
    return False

def get_shape():
    return Piece(5, 0, random.choice(shapes))

def draw_text(surface, text, size, color, x, y, font_name='droidsansmono'):
    font = pygame.font.Font(pygame.font.match_font(font_name), size)
    label = font.render(text, 1, color)
    surface.blit(label, (x, y))

def draw_grid_lines(surface, grid):
    for i in range(len(grid)):
        pygame.draw.line(surface, GRAY, (TOP_LEFT_X, TOP_LEFT_Y + i * BLOCK_SIZE), (TOP_LEFT_X + PLAY_WIDTH, TOP_LEFT_Y + i * BLOCK_SIZE))
    for j in range(len(grid[0])):
        pygame.draw.line(surface, GRAY, (TOP_LEFT_X + j * BLOCK_SIZE, TOP_LEFT_Y), (TOP_LEFT_X + j * BLOCK_SIZE, TOP_LEFT_Y + PLAY_HEIGHT))

def clear_rows(grid, locked):
    inc = 0
    for i in range(len(grid) - 1, -1, -1):
        row = grid[i]
        if BLACK not in row:
            inc += 1
            ind = i
            for j in range(len(row)):
                try:
                    del locked[(j, i)]
                except:
                    continue
    if inc > 0:
        for key in sorted(list(locked), key=lambda x: x[1])[::-1]:
            x, y = key
            if y < ind:
                new_key = (x, y + inc)
                locked[new_key] = locked.pop(key)
    return inc

def draw_next_shape(shape, surface):
    sx = TOP_LEFT_X + PLAY_WIDTH + 50
    sy = TOP_LEFT_Y + PLAY_HEIGHT / 2 - 100
    draw_text(surface, 'Next', 30, WHITE, sx + 45, sy - 40)
    
    format = shape.shape[shape.rotation % len(shape.shape)]
    for i, line in enumerate(format):
        row = list(line)
        for j, column in enumerate(row):
            if column == '0':
                pygame.draw.rect(surface, shape.color, (sx + j * BLOCK_SIZE, sy + i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 0)
                pygame.draw.rect(surface, LIGHT_GRAY, (sx + j * BLOCK_SIZE, sy + i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 2)


def draw_window(surface, grid, score=0, level=1, lines=0):
    surface.fill(BLACK)
    
    # --- Title ---
    font = pygame.font.Font(pygame.font.match_font('droidsansmono'), 60)
    label = font.render('TETRIS', 1, WHITE)
    surface.blit(label, (TOP_LEFT_X + PLAY_WIDTH / 2 - (label.get_width() / 2), 30))

    # --- Game Info ---
    sx = TOP_LEFT_X - 220
    sy = TOP_LEFT_Y + 100
    draw_text(surface, 'SCORE', 30, WHITE, sx + 50, sy)
    draw_text(surface, str(score), 30, WHITE, sx + 50, sy + 30)
    draw_text(surface, 'LEVEL', 30, WHITE, sx + 50, sy + 80)
    draw_text(surface, str(level), 30, WHITE, sx + 50, sy + 110)
    draw_text(surface, 'LINES', 30, WHITE, sx + 50, sy + 160)
    draw_text(surface, str(lines), 30, WHITE, sx + 50, sy + 190)

    # --- Draw Grid and Blocks ---
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            color = grid[i][j]
            pygame.draw.rect(surface, color, (TOP_LEFT_X + j * BLOCK_SIZE, TOP_LEFT_Y + i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 0)
            if color != BLACK:
                 pygame.draw.rect(surface, LIGHT_GRAY, (TOP_LEFT_X + j * BLOCK_SIZE, TOP_LEFT_Y + i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 2)


    # --- Draw Grid Lines and Border ---
    draw_grid_lines(surface, grid)
    pygame.draw.rect(surface, WHITE, (TOP_LEFT_X, TOP_LEFT_Y, PLAY_WIDTH, PLAY_HEIGHT), 4)

def draw_message(surface, text, size):
    overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 180))
    surface.blit(overlay, (0,0))
    draw_text(surface, text, size, WHITE, SCREEN_WIDTH/2 - len(text)*size/4, SCREEN_HEIGHT/2 - size)


def main(win):
    locked_positions = {}
    grid = create_grid(locked_positions)

    change_piece = False
    run = True
    current_piece = get_shape()
    next_piece = get_shape()
    clock = pygame.time.Clock()
    fall_time = 0
    fall_speed = 0.27
    level_time = 0
    score = 0
    lines = 0
    level = 1
    paused = False

    while run:
        grid = create_grid(locked_positions)
        fall_time += clock.get_rawtime()
        level_time += clock.get_rawtime()
        clock.tick()

        # --- Level Up ---
        if level_time / 1000 > 10: # 10秒ごとにレベルアップ
            level_time = 0
            if fall_speed > 0.12:
                fall_speed -= 0.005
                level += 1

        # --- Piece Falling ---
        if fall_time / 1000 >= fall_speed:
            fall_time = 0
            current_piece.y += 1
            if not (valid_space(current_piece, grid)) and current_piece.y > 0:
                current_piece.y -= 1
                change_piece = True

        # --- Event Handling ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
                pygame.display.quit()
                quit()

            if event.type == pygame.KEYDOWN:
                if not paused:
                    if event.key == pygame.K_LEFT:
                        current_piece.x -= 1
                        if not valid_space(current_piece, grid):
                            current_piece.x += 1
                    elif event.key == pygame.K_RIGHT:
                        current_piece.x += 1
                        if not valid_space(current_piece, grid):
                            current_piece.x -= 1
                    elif event.key == pygame.K_DOWN:
                        current_piece.y += 1
                        if not valid_space(current_piece, grid):
                            current_piece.y -= 1
                    elif event.key == pygame.K_UP:
                        current_piece.rotation = current_piece.rotation + 1 % len(current_piece.shape)
                        if not valid_space(current_piece, grid):
                            current_piece.rotation = current_piece.rotation - 1 % len(current_piece.shape)
                    elif event.key == pygame.K_SPACE: # Hard Drop
                        while valid_space(current_piece, grid):
                            current_piece.y += 1
                        current_piece.y -= 1
                        change_piece = True


                if event.key == pygame.K_p:
                    paused = not paused

        # --- Pause Screen ---
        if paused:
            draw_message(win, "Paused", 80)
            pygame.display.update()
            continue

        # --- Update Grid ---
        shape_pos = convert_shape_format(current_piece)
        for i in range(len(shape_pos)):
            x, y = shape_pos[i]
            if y > -1:
                grid[y][x] = current_piece.color

        # --- Lock Piece and Get New One ---
        if change_piece:
            for pos in shape_pos:
                p = (pos[0], pos[1])
                locked_positions[p] = current_piece.color
            current_piece = next_piece
            next_piece = get_shape()
            change_piece = False
            
            # --- Clear Rows and Update Score ---
            cleared_rows = clear_rows(grid, locked_positions)
            lines += cleared_rows
            score += cleared_rows * 10 * level

        # --- Draw Everything ---
        draw_window(win, grid, score, level, lines)
        draw_next_shape(next_piece, win)
        pygame.display.update()

        # --- Check if Lost ---
        if check_lost(locked_positions):
            draw_message(win, "YOU LOST!", 80)
            pygame.display.update()
            pygame.time.delay(2000)
            run = False

def main_menu(win):
    run = True
    while run:
        win.fill(BLACK)
        draw_text(win, 'Press Any Key To Play', 50, WHITE, SCREEN_WIDTH/2 - 250, SCREEN_HEIGHT/2 - 50)
        pygame.display.update()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
                quit()
            if event.type == pygame.KEYDOWN:
                main(win)
    pygame.quit()

# --- Main Game Loop ---
win = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption('Tetris')
main_menu(win)