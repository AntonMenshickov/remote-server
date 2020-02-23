const robot = require("robotjs");
const KeyboardLayout = require('keyboard-layout');

interface IKeyboardEvent {
    key: string,
    state: string
}

export const onKeyboardEvent = function (e: IKeyboardEvent) {
    try {
        robot.keyToggle(e.key, e.state);
        console.log(e);
    } catch (exception) {
        console.log(exception);
    }
};

export const createLanguageEvent = () => ({
    eventType: 'language',
    language: KeyboardLayout.getCurrentKeyboardLanguage()
});