const vscode = require("vscode");
const fetch = require("node-fetch");

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
	// Hourly reload
	var nextDate = new Date();

	if (nextDate.getMinutes() === 0) {
		// Fetch if full hour
		getData();
	} else {
		// Else get time of next full hour
		nextDate.setHours(nextDate.getHours() + 1);
		nextDate.setMinutes(0);
		nextDate.setSeconds(0);

		// Difference between now and the next full hour
		var difference = nextDate - new Date();

		// Fetch timeout until next full hour
		setTimeout(getData, difference);
	}

	// Reload command
	const disposable = vscode.commands.registerCommand("elektri-hind.reload", () => {
		reloadStatusBarItem();
	});

	context.subscriptions.push(disposable);

	// First fetch and creation
	getData();
}

// This method is called when your extension is deactivated
function deactivate() {
	statusBarPriceItem.dispose();
}

function setStatusBarItem(price) {
	statusBarPriceItem.text = price.toFixed(config.decimalPointsStatusBar).toString() + " €/kWh";

	statusBarPriceItem.tooltip = "Current electricity price (" + price.toFixed(config.decimalPointsTooltip).toString() + " €/kWh)";

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
