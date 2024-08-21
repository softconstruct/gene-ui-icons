import chalk from 'chalk';
import { exec } from 'child_process';
import { copyFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
const execCommand = (cmd, messageNamespace = '') =>
    new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }

            if (messageNamespace && stdout) {
                console.log(chalk.white.green.bold(`${messageNamespace}: ${stdout}`));
            }

            resolve(stdout || stderr);
        });
    });

const copyStaticFilesToDist = () => {
    const filesToCopy = ['package.json', 'README.md']; // need to add also LICENSE
    filesToCopy.forEach((file) =>
        copyFileSync(join(__dirname, '..', file), join(__dirname, '..', 'dist', file))
    );
};

const getFileSizeInBytes = (filePath) => {
    const stats = statSync(filePath);
    return stats.size;
};

const getDirFiles = (dirPath, arrayOfFiles = []) => {
    const files = readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = `${dirPath}/${file}`;
        if (statSync(filePath).isDirectory()) {
            arrayOfFiles = getDirFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
};

const getTotalSize = (directoryPath) => {
    const arrayOfFiles = getDirFiles(directoryPath);

    let totalSize = 0;

    arrayOfFiles.forEach((filePath) => {
        totalSize += statSync(filePath).size;
    });

    return totalSize;
};

export { execCommand, copyStaticFilesToDist, getFileSizeInBytes, getTotalSize };
