// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fetch = require("node-fetch");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

var statusBarPriceItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 9999);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {
	getData();

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
}

// This method is called when your extension is deactivated
function deactivate() {
	statusBarPriceItem.dispose();
}

function setStatusBarItem(price) {
	statusBarPriceItem.text = price.toFixed(5).toString() + " €/kWh";

	statusBarPriceItem.tooltip = "Current electricity price";

	statusBarPriceItem.show();
}

async function getData() {
	const response = await fetch("https://dashboard.elering.ee/api/nps/price/ee/current?group=ee");
	const data = await response.json();

	setStatusBarItem(data.data[0].price / 1000, true);
}

module.exports = {
	activate,
	deactivate,
};
