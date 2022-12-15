// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fetch = require("node-fetch");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

var config = vscode.workspace.getConfiguration("elektri-hind");

if (config.alignment == "left") {
	var alignment = vscode.StatusBarAlignment.Left;
} else {
	var alignment = vscode.StatusBarAlignment.Right;
}

var statusBarPriceItem = vscode.window.createStatusBarItem(alignment, config.alignmentPriority);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	var nextDate = new Date();

	if (nextDate.getMinutes() === 0) {
		getData();
	} else {
		nextDate.setHours(nextDate.getHours() + 1);
		nextDate.setMinutes(0);
		nextDate.setSeconds(0);

		var difference = nextDate - new Date();

		setTimeout(getData, difference);
	}

	const disposable = vscode.commands.registerCommand("elektri-hind.reload", () => {
		reloadStatusBarItem();
	});

	context.subscriptions.push(disposable);

	getData();
}

// This method is called when your extension is deactivated
function deactivate() {
	statusBarPriceItem.dispose();
}

function setStatusBarItem(price) {
	statusBarPriceItem.text = price.toFixed(config.decimalPoints).toString() + " €/kWh";

	statusBarPriceItem.tooltip = "Current electricity price (" + price.toString() + " €/kWh)";

	statusBarPriceItem.show();
}

async function getData() {
	const response = await fetch("https://dashboard.elering.ee/api/nps/price/ee/current?group=ee");
	const data = await response.json();

	setStatusBarItem(data.data[0].price / 1000, true);
}

function reloadStatusBarItem() {
	statusBarPriceItem.dispose();

	config = vscode.workspace.getConfiguration("elektri-hind");

	if (config.alignment == "left") {
		alignment = vscode.StatusBarAlignment.Left;
	} else {
		alignment = vscode.StatusBarAlignment.Right;
	}

	statusBarPriceItem = vscode.window.createStatusBarItem(alignment, config.alignmentPriority);

	getData();
}

module.exports = {
	activate,
	deactivate,
};
