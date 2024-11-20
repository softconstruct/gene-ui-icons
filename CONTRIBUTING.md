**Thank you for your interest in contributing to the @geneui/icons library! We appreciate your
efforts to help improve and expand this open-source project. This guide will help you get started
with setting up your development environment, adding or removing icons, and submitting your
contributions.**

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
- [Adding a New Icon](#adding-a-new-icon)
  - [Icon Naming Conventions](#icon-naming-conventions)
  - [Preparing Your SVG File](#preparing-your-svg-file)
  - [Using the Create Icon Script](#using-the-create-icon-script)
- [Removing an Icon](#removing-an-icon)
  - [Using the Remove Icon Script](#using-the-remove-icon-script)
- [Submitting Your Changes](#submitting-your-changes)
  - [Commit Message Guidelines](#commit-message-guidelines)
  - [Creating a Pull Request](#creating-a-pull-request)
- [Contact](#contact)

## 👋 Getting started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v14.x or later)
- npm (v6.x or later) or yarn (optional)
- Git

### Clone the Repository

Clone the [@geneui/icons repository](https://github.com/softconstruct/gene-ui-icons) repository to your local machine.

```bash
git clone https://github.com/your-username/geneui-icons.git
```

### Install Dependencies

Install the required dependencies using npm

```bash
npm install
```

or using yarn

```bash
yarn install
```

## 🆕 Adding a New Icon

### Icon Naming Conventions

- Icon Name: Must start with an uppercase letter and use PascalCase (e.g., AddUser, CheckCircle).
- Icon Set: Choose between Major and Minor based on the icon's usage context.

### Preparing Your SVG File

1. **Download**: SVG from Figma or another source.
2. **Place the SVG**: Add your SVG file to the `svgs/` directory.

### Using the Create Icon Script

We provide a script to streamline the process of adding a new icon.

1. Run the Create Icon script
```bash
npm run create-icon
```

2. Follow the prompts
- **Choose an Icon set:** Select Major or Minor.
- **Enter the Icon name:** Provide a unique name following the naming conventions.
- **Select the Icon SVG source file:** Choose your SVG file from the list.
- **Enter the Icon keywords:** Provide relevant keywords separated by commas.
- **Enter the Icon aliases:** Provide any aliases separated by commas.
- **Enter the Icon description:** Provide a brief description of the icon.

3. Upon successful completion, the script will
- Create the SVG and JSON metadata files in the `icons/` directory.
- Remove the source SVG file from the `svgs/` directory.

**Note:** If you encounter any errors during this process, the script will provide detailed messages to help you resolve them.

## ❌ Removing an Icon

### Using the Remove Icon Script

To remove an existing icon from the library

1. Run the remove icon script
```bash
npm run remove-icon
```
2. Follow the prompts
- **Select the Icon you want to remove:** Choose the icon from the list.
- **Confirmation:** Confirm that you want to remove the icon.

3. The script will delete the icon's SVG and JSON metadata files from the `icons/` directory.

## ⬆️ Submitting Your Changes

**Use the branch** `release/1.0.x` to push changes.

1. Ensure you are in the branch `release/1.0.x`.
```bash
git status
```
otherwise
```bash
git checkout release/1.0.x
```
2. Ensure your branch is up to date.
```bash
git pull
```

3. Stage all changes in your local machine.
```bash
git add .
```

4. Commit changes: write the action you have done (e.g Create, Remove) icon names.
```bash
git commit -m "Create clock, pencil icons and remove gear icon"
```

5. Push your changes to origin.
```bash
git push
```

## ☎️ Contact
If you have any questions or need assistance, feel free to reach out
- **Maintainer:** Hamik Hambardzumyan
- **Email:** hamik.hambardumyan@softconstruct.com
- **GitHub:** @hamikhambardzumyan
