import { mkdirSync, writeFileSync } from 'fs';
import chalk from 'chalk'
import path from 'path';
import ncp from 'ncp';
import { promisify } from 'util';
import { exec } from 'child_process';
import Listr from 'listr';
const copy = promisify(ncp)

export async function createApp(appData) {
    try {
        // console.log(appData);
        const projectPath = `${process.cwd()}/${appData.name}`
        const boilerPlatePath = path.join(__dirname, "assets/boiler-plates/javascript")

        const tasks = new Listr([
            {
                title: chalk.cyan("Initializing ez project"),
                task: () => mkdirSync(projectPath)
            },
            {
                title: chalk.cyan("Copying project files"),
                task: async () => await copy(boilerPlatePath, projectPath)
            },
            {
                title: chalk.cyan("Marking directory as an ez project"),
                task: () => {
                    const projectData = `A project has been created with ez.js. Following are the specs for the project. \n\n${JSON.stringify(appData)}`
                    writeFileSync(projectPath + '/.ez', projectData)
                }
            }
        ])

        await tasks.run()

        console.log(chalk.greenBright(`New ez app has been created with name ${appData.name}.`))
    } catch (err) {
        console.log(err)
    }
}