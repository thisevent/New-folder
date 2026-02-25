# Copilot Instructions

## Project Overview
This is a simple Python automation utility that moves the mouse pointer to random positions on the screen at regular intervals.

## Key Dependencies
- **pyautogui**: Used for mouse control (`moveTo()`) and screen dimension detection (`size()`)
  - Must be installed: `pip install pyautogui`
  - May require additional platform-specific setup on Linux/macOS

## Code Behavior
The script in `test.py`:
1. Waits 3 seconds for user to switch to target window (with `time.sleep(3)`)
2. Enters an infinite loop that:
   - Gets screen width/height using `pyautogui.size()`
   - Generates random X,Y coordinates within screen bounds
   - Smoothly moves mouse to that position over 0.5 seconds with `moveTo(random_x, random_y, duration=0.5)`
   - Waits 5 seconds before next movement

## Important Patterns
- **Initial delay**: The 3-second pause at startup is intentional (`time.sleep(3)`), allowing manual window switching before automation begins
- **Smooth movement**: Mouse moves use `duration=0.5` for natural motion, not instant jumps
- **Infinite loop**: No exit condition—script runs until manually terminated
- **Screen-bound coordinates**: Uses `random.randint(0, screen_width/height)` to ensure clicks stay within visible area

## Suggested Improvements (if enhancing)
- Add keyboard interrupt handler to gracefully exit (`KeyboardInterrupt`)
- Consider making 5-second interval and 0.5-second move duration configurable
- Add logging to track mouse positions for debugging
