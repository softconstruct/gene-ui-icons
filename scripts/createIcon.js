import { readdir, appendFile, readFile, unlink } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import process from 'process';
import ora from 'ora';
import prettier from 'prettier';

import iconMetadataTemplate from './ICON_TEMPLATES/IconNameSet.json';

let prettierConfig;
const iconsDirPath = path.join(__dirname, '../icons');

const spinner = ora({
    color: 'yellow',
    text: 'Creating the Icon'
});

const messages = {
    ERROR_ICON_NAME_EMPTY: chalk.white.bgRedBright.bold("error: Icon's name can't be empty!"),
    ERROR_ICON_NAME_IS_NOT_CORRECT: chalk.white.bgRedBright.bold(
        "error: Icon's name should start with upper case!"
    ),
    ERROR_DUPLICATE_NAME: chalk.white.bgRedBright.bold(
        'error: Icon with this name already exists.'
    ),
    SUCCESS: (iconName) =>
        chalk.white.bgGreen.bold(`success: The ${iconName} icon is successfully created!`),
    ERROR: (error) => chalk.white.bgRedBright.bold(`error: ${error}.`)
};

let newIcon = { ...iconMetadataTemplate };

const init = () => {
    console.log(
        chalk.yellow(
            figlet.textSync('Add new Icon', {
                font: 'small'
            })
        )
    );
};

const askQuestions = (sourceSVGsList = []) => {
    const questions = [
        {
            name: 'set',
            type: 'list',
            prefix: '[?]',
            message: 'Choose an Icon set: ',
            choices: ['Major', 'Minor'],
            filter: (value) => {
                newIcon.set = value;
                return value;
            }
        },
        {
            name: 'name',
            type: 'input',
            message: 'Please enter the Icon name: ',
            prefix: '[?]',
            filter: (inputValue) => {
                //Todo
                return inputValue.trim();
            },
            validate: async (inputValue) => {
                if (typeof inputValue !== 'string' || inputValue.trim() === '') {
                    console.log(messages.ERROR_ICON_NAME_EMPTY);
                    return false;
                } else {
                    if (inputValue[0].toUpperCase() !== inputValue[0]) {
                        console.log(messages.ERROR_ICON_NAME_IS_NOT_CORRECT);
                        return false;
                    }

                    const files = await readdir(`${iconsDirPath}`);

                    for (let i = 0; i < files.length; i++) {
                        if (`${files[i].replace(newIcon.set, '')}` === `${inputValue}.svg`) {
                            console.log(messages.ERROR_DUPLICATE_NAME);
                            return false;
                        }
                    }
                }

                return true;
            }
        },
        {
            name: 'svgSrcPath',
            type: 'list',
            message: 'Please select the Icon SVG source file: ',
            prefix: '[?]',
            choices: sourceSVGsList
        },
        {
            name: 'keywords',
            type: 'input',
            message: 'Please enter the Icon keywords: ',
            prefix: '[?]',
            filter: (value) => value.split(',').map((keyword) => keyword.trim())
        },
        {
            name: 'aliases',
            type: 'input',
            message: 'Please enter the Icon aliases: ',
            prefix: '[?]',
            filter: (value) => value.split(',').map((keyword) => keyword.trim())
        },
        {
            name: 'description',
            type: 'input',
            message: 'Please enter the Icon description: ',
            prefix: '[?]'
        }
    ];

    return inquirer.prompt(questions);
};

const createSvg = async ({ name, svgSrcPath }) => {
    try {
        const svgSrcCode = await readFile(svgSrcPath, 'utf-8');
        await appendFile(`./icons/${name}.svg`, svgSrcCode);
    } catch (error) {
        return {
            hasError: true,
            error
        };
    }
};

const createMetadata = async ({ name, set, keywords, aliases, description, sizes }) => {
    try {
        await appendFile(
            `./icons/${name}.json`,
            prettier.format(
                JSON.stringify({
                    id: `${name}${set}`,
                    name,
                    set,
                    keywords,
                    aliases,
                    description,
                    sizes,
                    creation_date: new Date().toLocaleString()
                }),
                { ...prettierConfig, parser: 'json' }
            )
        );
    } catch (error) {
        return {
            hasError: true,
            error
        };
    }
};

const removeSourceSvgFile = async (fileName) => {
    try {
        await unlink(fileName);
    } catch (error) {
        return {
            hasError: true,
            error
        };
    }
};

const getSGVsList = async () => {
    const SVGsList = await readdir(path.join(__dirname, '../svgs'), {
        withFileTypes: true
    });

    return [
        ...SVGsList.map(({ name }) => `svgs/${name}`).filter((fileName) =>
            fileName.endsWith('.svg')
        )
    ];
};

const main = async () => {
    // Show script introduction
    init();

    prettierConfig = await prettier.resolveConfig(path.join(__dirname, `../configs/.prettierrc`));

    // Collect all possible icons SVGs
    const SVGsList = await getSGVsList();

    // Ask questions
    const answers = await askQuestions(SVGsList);

    // Create files
    spinner.start();
    newIcon = { ...newIcon, ...answers };
    const svgCreationResult = await createSvg(newIcon);

    if (svgCreationResult?.hasError === true) {
        console.log(messages.ERROR(svgCreationResult?.error));
        process.exit(1);
    } else {
        const createMetadataResult = await createMetadata(newIcon);

        if (createMetadataResult?.hasError === true) {
            spinner.fail(messages.ERROR(createMetadataResult?.error));
            process.exit(1);
        } else {
            const removeSourceSvgFileResult = await removeSourceSvgFile(answers.svgSrcPath);

            if (removeSourceSvgFileResult?.hasError === true) {
                spinner.fail(messages.ERROR(removeSourceSvgFileResult?.error));
                process.exit(1);
            } else {
                spinner.succeed(messages.SUCCESS(newIcon.name));
            }
        }
    }
};

process.on('exit', (code) => {
    if (code !== 0) {
        spinner.fail(messages.ERROR(`process exited with ${code} status code`));
    }
});

main();
