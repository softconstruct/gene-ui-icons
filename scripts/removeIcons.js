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
    SUCCESS: (count) =>
        chalk.black.bgGreen.bold(
            `success: ${count} icon(s) were successfully removed from the @gene-ui/icons package!`
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

// Changed from 'list' to 'checkbox' to allow multiple selection
const askQuestions = (iconsList = []) => {
    const questions = [
        {
            name: 'iconNames',
            type: 'checkbox',
            message: 'Please select the Icon(s) you want to remove:',
            prefix: '[?]',
            choices: iconsList
        }
    ];

    return inquirer.prompt(questions);
};

// Simplify confirmation to a single question, or you could ask once per icon if desired
const askConfirmation = (iconNames = []) => {
    const questions = [
        {
            name: 'approved',
            type: 'list',
            message: `Are you sure you want to remove the following icons?\n${iconNames.join(
                ', '
            )}`,
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

    return SVGsList.filter(({ name }) => name.endsWith('.svg')).map(({ name }) =>
        name.replace('.svg', '')
    );
};

const removeIcon = async (iconName) => {
    try {
        // Remove icon files
        await unlink(`${iconsDirPath}/${iconName}.svg`);
        await unlink(`${iconsDirPath}/${iconName}.json`);
        return { hasError: false };
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

    if (!iconsList.length) {
        spinner.succeed(messages.EMPTY);
        return;
    }

    // Ask which icons to remove
    const { iconNames } = await askQuestions(iconsList);

    // If nothing selected, exit
    if (!iconNames.length) {
        spinner.succeed('No icons were selected to remove.');
        return;
    }

    // Ask confirmation once for all selected icons
    const { approved } = await askConfirmation(iconNames);

    if (!approved) {
        spinner.succeed('No icons were removed.');
        return;
    }

    // Remove each selected icon
    spinner.start(`Removing selected icon(s): ${iconNames.join(', ')}`);

    for (const iconName of iconNames) {
        const iconRemovingResult = await removeIcon(iconName);

        // If any removal fails, log and exit immediately (or handle differently if you want partial success)
        if (iconRemovingResult?.hasError) {
            spinner.fail(messages.ERROR(iconRemovingResult.error));
            process.exit(1);
        }
    }

    // If all went fine
    spinner.succeed(messages.SUCCESS(iconNames.length));
};

process.on('exit', (code) => {
    if (code !== 0) {
        spinner.fail(messages.ERROR(`process exited with ${code} status code`));
    }
});

main();
