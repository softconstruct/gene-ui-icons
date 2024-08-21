import { readdir, unlink } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import process from 'process';
import ora from 'ora';

const iconsDirPath = path.join(__dirname, '../icons');

const spinner = ora({
    color: 'yellow'
});

const messages = {
    SUCCESS: (iconName) =>
        chalk.black.bgGreen.bold(
            `success: The ${iconName} icon was successfully removed from the @gene-ui/icons package!`
        ),
    ERROR: (error) => chalk.white.bgRedBright.bold(`error: ${error}.`),
    EMPTY: 'There are no icons to remove'
};

const init = () => {
    console.log(
        chalk.yellow(
            figlet.textSync('Remove Icon', {
                font: 'small'
            })
        )
    );
};

const askQuestions = (iconsList = []) => {
    const questions = [
        {
            name: 'iconName',
            type: 'list',
            message: 'Please select the Icon you want to remove: ',
            prefix: '[?]',
            choices: iconsList
        }
    ];

    return inquirer.prompt(questions);
};

const askConfirmation = (iconName = '') => {
    const questions = [
        {
            name: 'approved',
            type: 'list',
            message: `Are you sure you want to remove the ${iconName} icon from the @gene-ui/icons package: `,
            prefix: '[?]',
            choices: ['Yes', 'No'],
            filter: (value) => value === 'Yes'
        }
    ];

    return inquirer.prompt(questions);
};

const getIconsList = async () => {
    const SVGsList = await readdir(iconsDirPath, {
        withFileTypes: true
    });

    return [
        ...SVGsList.filter(({ name }) => name.endsWith('.svg')).map(({ name }) =>
            name.replace('.svg', '')
        )
    ];
};

const removeIcon = async (iconName) => {
    try {
        // Remove files
        await unlink(`${iconsDirPath}/${iconName}.svg`);
        await unlink(`${iconsDirPath}/${iconName}.json`);
    } catch (error) {
        return {
            hasError: true,
            error
        };
    }
};

const main = async () => {
    // Show script introduction
    init();

    // Collect all existing icons
    const iconsList = await getIconsList();

    if (iconsList.length) {
        // Ask questions
        const { iconName } = await askQuestions(iconsList);

        // Ask confirmation
        const { approved } = await askConfirmation(iconName);

        if (approved) {
            // Remove the icon files
            spinner.start(`Removing the ${iconName}`);

            const iconRemovingResult = await removeIcon(iconName);

            if (iconRemovingResult?.hasError === true) {
                console.log(messages.ERROR(iconRemovingResult?.error));
                process.exit(1);
            } else {
                spinner.succeed(messages.SUCCESS(iconName));
            }
        }
    } else {
        spinner.succeed(messages.EMPTY);
    }
};

process.on('exit', (code) => {
    if (code !== 0) {
        spinner.fail(messages.ERROR(`process exited with ${code} status code`));
    }
});

main();
