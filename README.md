# @geneui/icons

<!-- [![NPM registry](https://img.shields.io/npm/v/react-box-virtualization?style=for-the-badge&color=red)](https://www.npmjs.com/package/react-box-virtualization) -->

The icons library created for the Gene UI design system.

## Getting Started

The icons in this package are now available as full React components, making it easy to integrate
them directly into your project.

## ⚙️ Installation

1. Install `@geneui/icons` as a dependency:

    Using [NPM](https://www.npmjs.com/):

    ```bash
    npm install @geneui/icons --save
    ```

    Or, using [Yarn](https://yarnpkg.com/en/):

    ```bash
    yarn add @geneui/icons
    ```

## 👨‍💻 Usage

To utilize the icons from the Gene UI icons collection as React components with customizable size
and color, follow these steps:

1. **Import an Icon:**

    Import the desired icon directly from the Gene UI icons collection. For example, to import the
    `Check` icon:

    ```tsx
    import { Check } from '@geneui/icons';
    ```

2. **Use the Icon as a Component:**

    Use the imported icon directly in your JSX and customize it with `size` and `color` props:

    ```tsx
    <Check size={24} color="red" />
    ```

### Icon Props

The icons accept the following props:

-   **`size`** (optional): Defines the size of the icon. Can be one of `16`, `20`, `24`, `28`, `32`,
    `48`.
-   **`color`** (optional): Defines the color of the icon. Accepts any valid CSS color value.

This allows you to seamlessly integrate and customize icons from the Gene UI icons collection as
React components in your project.

## 👍 Contributing

We welcome contributions from the community! Here's how you can get involved to add, remove, or
rename icons:

> 👉 See the
> [contributing docs](https://github.com/softconstruct/gene-ui-icons/blob/main/CONTRIBUTING.md).

## ⚖️ License

The Gene UI design system's icons are licensed under the
[MIT License](https://github.com/softconstruct/gene-ui-components/blob/main/LICENSE).
