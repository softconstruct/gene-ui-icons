import path from 'path';
import { readFile } from 'fs/promises';
import { createFilter } from '@rollup/pluginutils';
import { transform } from '@svgr/core';
import { optimize } from 'svgo';

// When using typescript code it wasn't work after AST modifications
const customTemplate = ({ componentName, jsx }, { tpl }) => {
    // Recursively modify the AST to apply the color and size props
    function modifyAttributes(node) {
        if (node.openingElement && node.openingElement.attributes) {
            node.openingElement.attributes = node.openingElement.attributes.map((attr) => {
                if (attr.name) {
                    if (attr.name.name === 'width' || attr.name.name === 'height') {
                        return {
                            type: 'JSXAttribute',
                            name: { type: 'JSXIdentifier', name: attr.name.name },
                            value: {
                                type: 'JSXExpressionContainer',
                                expression: { type: 'Identifier', name: 'size' }
                            }
                        };
                    }

                    if (attr.name.name === 'stroke' || attr.name.name === 'fill') {
                        return {
                            type: 'JSXAttribute',
                            name: { type: 'JSXIdentifier', name: attr.name.name },
                            value: {
                                type: 'JSXExpressionContainer',
                                expression: { type: 'Identifier', name: 'color' }
                            }
                        };
                    }
                }

                return attr;
            });
        }

        // Recursively apply to children if they exist
        if (node.children) {
            node.children = node.children.map(modifyAttributes);
        }

        return node;
    }

    // Apply the modifications to the main JSX element
    const modifiedJsx = modifyAttributes(jsx);

    return tpl`
    import React from 'react';

    const ${componentName} = ({ size = 24, color = "currentColor", ...props }) => (
      ${modifiedJsx}
    );

    export default ${componentName};
  `;
};

/**
 * Rollup plugin for processing SVG files:
 *
 * - Optimizes SVGs using SVGO with custom configuration.
 * - Saves optimized SVGs to the specified `outputFolder` for raw icon access.
 * - Inline optimized SVGs into JavaScript via SVGR for React component imports.
 */
const svgBuild = (options = {}) => {
    const filter = createFilter(options.include || '**/*.svg', options.exclude);

    const svgoConfig = {
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        /**
                         * viewBox is needed in order to produce 20px by 20px containers
                         * with smaller (minor) icons inside.
                         */
                        removeViewBox: false,

                        /**
                         * The following 2 settings are disabled to reduce rendering inconsistency
                         * on Android. Android uses a subset of the SVG spec called SVG Tiny:
                         * https://developer.android.com/studio/write/vector-asset-studio#svg-support
                         */

                        /**
                         * Merging multiple detached paths into a single path can lead to
                         * rendering issues on some platforms where detached paths are joined
                         * by hairlines. Not merging paths results in greater compatibility
                         * with minimal additional overhead.
                         */
                        mergePaths: false,

                        convertPathData: {
                            /**
                             * Mixing absolute and relative path commands can lead to rendering
                             * issues on some platforms. This disables converting some path data to
                             * absolute if it is shorter, keeping all path data relative. Using
                             * relative paths means that data points are relative  to the current
                             * point at the start of the path command, which does not greatly
                             * increase the quantity of path data.
                             */
                            utilizeAbsolute: false
                        }
                    }
                }
            }
        ]
    };

    // TODO: Remove after full testing
    // svgoConfig.plugins.push({
    //     ...replaceFillAttributeSvgoPlugin()
    // });

    const optimizedSVGs = [];

    return {
        name: 'svgBuild',
        async transform(source, id) {
            if (!filter(id) || id.slice(-4) !== '.svg') {
                return null;
            }

            const rawSvg = await readFile(id, 'utf8');
            const { data: optimizedSvg } = optimize(rawSvg, {
                ...svgoConfig,
                path: id
            });

            optimizedSVGs.push({ id, optimizedSvg });

            const svgrState = { filePath: id, caller: { name: 'svgBuild' } };

            // Pass the custom template in the SVGR options
            const jsCode = await transform(
                optimizedSvg,
                {
                    typescript: true,
                    template: customTemplate
                },
                svgrState
            );

            return {
                code: jsCode,
                ast: {
                    type: 'Program',
                    sourceType: 'module',
                    start: 0,
                    end: null,
                    body: []
                },
                map: { mappings: '' }
            };
        },
        buildEnd() {
            optimizedSVGs.forEach(({ id, optimizedSvg }) => {
                this.emitFile({
                    type: 'asset',
                    fileName: `icons/${path.basename(id)}`,
                    source: optimizedSvg
                });
            });
        }
    };
};

//TODO Remove after full testing
/**
 * An SVGO plugin that applies a transform function to every fill attribute
 * in an SVG. This lets you replace fill colors or remove them entirely.
 */
const replaceFillAttributeSvgoPlugin = () => {
    return {
        type: 'perItem',
        name: 'replaceFillAttribute',
        description: 'replaces fill attributes using a user-defined function',
        fn(item) {
            if (!item.isElem()) {
                return;
            }

            if (item.attr('fill')) {
                item.removeAttr('fill');
            }
        }
    };
};

export default svgBuild;
