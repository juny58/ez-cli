import { createApp } from "./create-app"

const commandFuntionMap = {
    createApp: createApp
}

export function executeCommand(commandObject) {
    commandFuntionMap[commandObject.command](commandObject)
}