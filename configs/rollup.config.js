import { resolve as resolvePath, join } from 'path';
import { readFileSync } from 'fs';
import { babel } from '@rollup/plugin-babel';
import virtual from '@rollup/plugin-virtual';
import glob from 'glob';
import svgBuild from '../scripts/rollup-plugin-build-svg';

const iconBasePath = join(__dirname, '../icons');

const iconExports = [];
const iconTypes = [
    `
interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: 16 | 20 | 24 | 28 | 32 | 48;
    color?: string;
}
`
];
const iconMetadata = {};

const iconPaths = glob.sync(join(iconBasePath, '*'));

iconPaths.forEach((filename) => {
    if (filename.endsWith('.svg')) {
        const exportName = filename.replace(`${iconBasePath}/`, '').replace('.svg', '');
        iconExports.push(`export { default as ${exportName} } from '../icons/${exportName}.svg';`);
        iconTypes.push(`export declare const ${exportName}: React.FC<IconProps>;`);
    }

    if (filename.endsWith('.json')) {
        const iconData = JSON.parse(readFileSync(filename, 'utf-8'));
        const exportName = filename.replace(`${iconBasePath}/`, '').replace('.json', '');

        iconMetadata[exportName] = {
            ...iconData
        };
    }
});

// Define files contents
const metadataContent = `
const metadata = ${JSON.stringify(iconMetadata, null, 2)};
export default metadata;
`.trim();

const metadataTypes = `export interface Icon {
    id: string;
    name: string;
    set: 'major' | 'minor';
    type: 'filled' | 'outline';
    description: string;
    keywords: string[];
    aliases: string[];
    sizes: 16 | 20 | 24 | 28 | 32 | 48;
    deprecated: boolean;
}
  
declare const metadata: {
    [iconId: string]: Icon;
};
  
export default metadata;
`.trim();

const entrypointContent = iconExports.join('\n');
const entrypointTypes = iconTypes.join('\n');

/**
 * A plugin that emits a custom asset file during the build process.
 *
 * - Warns if the source content is empty.
 * - Emits the specified file with the provided content at the end of the build.
 */
const customTypes = ({ fileName, source }) => {
    return {
        name: 'custom-types',
        buildEnd() {
            if (source.length === 0) {
                this.warn('source content is empty');
            }

            this.emitFile({ type: 'asset', fileName, source });
        }
    };
};

/**
 * Generates distinct chunks for each icon, enabling consuming applications
 * to split icons into smaller sub-chunks instead of combining all
 * icons into a single shared chunk.
 */
const manualChunksHandler = (id) => {
    if (id.startsWith(iconBasePath)) {
        return id.replace(iconBasePath, 'icons/').replace('.svg', '');
    }
};

/**
 * Specifies module interop behavior, explicitly setting React to `defaultOnly`
 * to eliminate unnecessary interop code.
 */
const interop = (id) => (id === 'react' ? 'defaultOnly' : 'auto');

export default [
    {
        input: 'src/index.js',
        output: [
            // {
            //     dir: 'dist',
            //     format: 'cjs',
            //     interop,
            //     entryFileNames: '[name].js',
            //     chunkFileNames: '[name].js',
            //     manualChunks: manualChunksHandler
            // },
            {
                dir: 'dist',
                format: 'esm',
                interop,
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                manualChunks: manualChunksHandler
            }
        ],
        external: ['react'],
        plugins: [
            virtual({
                'src/index.js': entrypointContent
            }),
            svgBuild({ include: `${iconBasePath}/*` }),
            babel({
                babelHelpers: 'bundled',
                babelrc: true,
                configFile: resolvePath(__dirname, '.babelrc'),
                extensions: ['.js', '.svg'],
                exclude: 'node_modules/**'
            }),
            customTypes({ fileName: `index.d.ts`, source: entrypointTypes })
        ]
    },
    {
        input: 'src/metadata.js',
        output: [
            // {
            //     dir: 'dist',
            //     format: 'cjs',
            //     entryFileNames: '[name].js',
            //     exports: 'default'
            // },
            {
                dir: 'dist',
                format: 'esm',
                entryFileNames: '[name].js'
            }
        ],
        plugins: [
            virtual({
                'src/metadata.js': metadataContent
            }),
            customTypes({ fileName: `metadata.d.ts`, source: metadataTypes })
        ]
    }
];
