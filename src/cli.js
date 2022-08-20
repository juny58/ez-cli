import arg from 'arg';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { default as commandList } from './commands/command-list.json';
import { executeCommand } from './commands'

function parseArgumentsIntoOptions(rawArgs) {
    let args
    try {
        args = arg(
            {
                '--git': Boolean,
                '--yes': Boolean,
                '--typescript': Boolean,
                '--javascript': Boolean,
                '--port': String,
                '--g': Boolean,
                '--y': Boolean,
                '--ts': Boolean,
                '--js': Boolean,
                '--p': String
            },
            {
                argv: rawArgs.slice(2),
                permissive: true
            }
        );
    } catch (err) {
        return {
            invalidMessage: `${chalk.redBright("Unknown error - ")} [${{...err}.name}] ${chalk.redBright("with code:")} ${{...err}.code}.`
        }
    }
    const option = {
        skipPrompts: (args['--yes'] || args['--y']) || false,
        git: (args['--git'] || args['--g']) || false,
        command: args._[0],
        isJavascript: !(args['--typescript'] || args['--ts'])
    };

    if (option.command) {
        const commandObj = commandList.find(command => command.command === option.command)
        if (commandObj) {
            option.isNameRequired = commandObj.isNameRequired
            option.name = args._[commandObj.nameIndex]
        }
        option.isValidCommand = !!commandObj
        const flags = { ...args };
        delete flags._
        for (let i = 0; i < Object.keys(flags).length; i++) {
            if (!commandObj.allowedFlags.includes(Object.keys(flags)[i])) {
                option.invalidMessage = chalk.redBright(`Flag '${Object.keys(flags)[i]}' is not allowed for command '${option.command}'`)
                break;
            }
        }
    }

    return option;
}

async function promptForMissingOptions(options) {
    if (options.skipPrompts) {
        return {
            ...options,
            git: true,
        };
    }

    const questions = [];

    if (options.isNameRequired && !options.name) {
        questions.push({
            type: 'input',
            name: 'name',
            message: "What would be the name of the entity?"
        })
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        name: options.name || answers.name,
        git: options.git || answers.git,
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);

    if (options.invalidMessage) {
        return console.log(options.invalidMessage)
    }

    if (!options.command) {
        return console.log(chalk.redBright("No command provided. Type:") + chalk.greenBright(" ez ") + chalk.yellow("<command> <type> <name>"))
    }

    if (!options.isValidCommand) {
        return console.log(chalk.redBright(
            `Command '${options.command}' is not a valid command. Valid commands are:${commandList.map(command => ` '${command.command}'`)}.`
        ))
    }

    options = await promptForMissingOptions(options);

    executeCommand(options);
}