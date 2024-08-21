import chalk from 'chalk';
import process from 'process';
import ora from 'ora';
import boxen from 'boxen';
import { partial } from 'filesize';
import { rmSync } from 'fs';
import { resolve } from 'path';
import { execCommand, copyStaticFilesToDist, getFileSizeInBytes, getTotalSize } from './utils';

const size = partial({ base: 2, standard: 'jedec' });

const spinner = ora({
    color: 'yellow',
    fail: 'Something went wrong please see errors bellow!'
});

const messages = {
    ERROR: (error) => chalk.white.redBright.bold(`error: ${error}.`)
};

const build = async () => {
    try {
        rmSync(resolve(__dirname, '../dist'), { recursive: true, force: true });

        await execCommand(
            'rollup -c ./configs/rollup.config.js --bundleConfigAsCjs',
            'rollup.config'
        );

        copyStaticFilesToDist();
    } catch (error) {
        return {
            hasError: true,
            error
        };
    }
};

const main = async () => {
    spinner.start('Packaging the @gene-ui/icons \n');

    const buildResult = await build();

    if (buildResult?.hasError) {
        spinner.fail(messages.ERROR(buildResult?.error));
        process.exit(1);
    } else {
        spinner.succeed();

        const packageIndexSize = size(getFileSizeInBytes(resolve(__dirname, '../dist/index.js')));
        const packageIconsSize = size(getTotalSize(resolve(__dirname, '../dist/icons')));
        const boxenText = chalk.greenBright(
            `index.js: ${packageIndexSize}\nicons: ${packageIconsSize}`
        );

        console.log(
            boxen(boxenText, {
                title: 'Package size',
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'yellow',
                textAlignment: 'left'
            })
        );
    }
};

process.on('exit', (code) => {
    if (code !== 0) {
        spinner.fail(messages.ERROR(`process exited with ${code} status code`));
    }
});

main();
