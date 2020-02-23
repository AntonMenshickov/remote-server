const robot = require("robotjs");


enum MouseButton {
    left = 'left',
    right = 'right',
    middle = 'middle'
}

enum MouseButtonState {
    down = 'down',
    up = 'up',
}

interface IMouseButtonStatus {
    readonly button: MouseButton;
    readonly state: MouseButtonState
}

interface IMouseEvent {
    dx?: number;
    dy?: number;
    buttons: IMouseButtonStatus[]
    scroll?: number;
}

robot.setMouseDelay(1);

export const onMouseEvent = function (e: IMouseEvent) {
    const screenSize = robot.getScreenSize();
    const currentMousePosition = robot.getMousePos();
    const positionX = Math.max(Math.min(e.dx + currentMousePosition.x, screenSize.width), 0);
    const positionY = Math.max(Math.min(e.dy + currentMousePosition.y, screenSize.height), 0);
    e.buttons.forEach(b => {
        robot.mouseToggle(MouseButtonState[b.state], MouseButton[b.button]);
    });
    robot.moveMouse(positionX, positionY);
    robot.scrollMouse(0, e.scroll);
};