"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const typeConverters = require("../utils/typeConverters");
const codeAction_1 = require("../utils/codeAction");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle(__filename);
class ApplyCodeActionCommand {
    constructor(client, telemetryReporter) {
        this.client = client;
        this.telemetryReporter = telemetryReporter;
        this.id = ApplyCodeActionCommand.ID;
    }
    async execute(action) {
        if (action.fixName) {
            /* __GDPR__
                "quickFix.execute" : {
                    "fixName" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.telemetryReporter.logTelemetry('quickFix.execute', {
                fixName: action.fixName
            });
        }
        return codeAction_1.applyCodeActionCommands(this.client, action);
    }
}
ApplyCodeActionCommand.ID = '_typescript.applyCodeActionCommand';
class ApplyFixAllCodeAction {
    constructor(client, telemetryReporter) {
        this.client = client;
        this.telemetryReporter = telemetryReporter;
        this.id = ApplyFixAllCodeAction.ID;
    }
    async execute(file, tsAction) {
        if (!tsAction.fixId) {
            return;
        }
        if (tsAction.fixName) {
            /* __GDPR__
                "quickFixAll.execute" : {
                    "fixName" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.telemetryReporter.logTelemetry('quickFixAll.execute', {
                fixName: tsAction.fixName
            });
        }
        const args = {
            scope: {
                type: 'file',
                args: { file }
            },
            fixId: tsAction.fixId
        };
        try {
            const combinedCodeFixesResponse = await this.client.execute('getCombinedCodeFix', args);
            if (!combinedCodeFixesResponse.body) {
                return;
            }
            const edit = typeConverters.WorkspaceEdit.fromFromFileCodeEdits(this.client, combinedCodeFixesResponse.body.changes);
            await vscode.workspace.applyEdit(edit);
            if (combinedCodeFixesResponse.command) {
                await vscode.commands.executeCommand(ApplyCodeActionCommand.ID, combinedCodeFixesResponse.command);
            }
        }
        catch (_a) {
            // noop
        }
    }
}
ApplyFixAllCodeAction.ID = '_typescript.applyFixAllCodeAction';
/**
 * Unique set of diagnostics keyed on diagnostic range and error code.
 */
class DiagnosticsSet {
    constructor(_values) {
        this._values = _values;
    }
    static from(diagnostics) {
        const values = new Map();
        for (const diagnostic of diagnostics) {
            values.set(DiagnosticsSet.key(diagnostic), diagnostic);
        }
        return new DiagnosticsSet(values);
    }
    static key(diagnostic) {
        const { start, end } = diagnostic.range;
        return `${diagnostic.code}-${start.line},${start.character}-${end.line},${end.character}`;
    }
    get values() {
        return this._values.values();
    }
}
class SupportedCodeActionProvider {
    constructor(client) {
        this.client = client;
    }
    async getFixableDiagnosticsForContext(context) {
        const supportedActions = await this.supportedCodeActions;
        const fixableDiagnostics = DiagnosticsSet.from(context.diagnostics.filter(diagnostic => supportedActions.has(+(diagnostic.code))));
        return Array.from(fixableDiagnostics.values);
    }
    get supportedCodeActions() {
        if (!this._supportedCodeActions) {
            this._supportedCodeActions = this.client.execute('getSupportedCodeFixes', null, undefined)
                .then(response => response.body || [])
                .then(codes => codes.map(code => +code).filter(code => !isNaN(code)))
                .then(codes => new Set(codes));
        }
        return this._supportedCodeActions;
    }
}
class TypeScriptQuickFixProvider {
    constructor(client, formattingConfigurationManager, commandManager, diagnosticsManager, bufferSyncSupport, telemetryReporter) {
        this.client = client;
        this.formattingConfigurationManager = formattingConfigurationManager;
        this.diagnosticsManager = diagnosticsManager;
        this.bufferSyncSupport = bufferSyncSupport;
        commandManager.register(new ApplyCodeActionCommand(client, telemetryReporter));
        commandManager.register(new ApplyFixAllCodeAction(client, telemetryReporter));
        this.supportedCodeActionProvider = new SupportedCodeActionProvider(client);
    }
    async provideCodeActions(document, _range, context, token) {
        if (!this.client.apiVersion.has213Features()) {
            return [];
        }
        const file = this.client.normalizePath(document.uri);
        if (!file) {
            return [];
        }
        const fixableDiagnostics = await this.supportedCodeActionProvider.getFixableDiagnosticsForContext(context);
        if (!fixableDiagnostics.length) {
            return [];
        }
        if (this.bufferSyncSupport.hasPendingDiagnostics(document.uri)) {
            return [];
        }
        await this.formattingConfigurationManager.ensureConfigurationForDocument(document, token);
        const results = [];
        for (const diagnostic of fixableDiagnostics) {
            results.push(...await this.getFixesForDiagnostic(document, file, diagnostic, token));
        }
        return results;
    }
    async getFixesForDiagnostic(document, file, diagnostic, token) {
        const args = Object.assign({}, typeConverters.Range.toFileRangeRequestArgs(file, diagnostic.range), { errorCodes: [+(diagnostic.code)] });
        const codeFixesResponse = await this.client.execute('getCodeFixes', args, token);
        if (codeFixesResponse.body) {
            const results = [];
            for (const tsCodeFix of codeFixesResponse.body) {
                results.push(...await this.getAllFixesForTsCodeAction(document, file, diagnostic, tsCodeFix));
            }
            return results;
        }
        return [];
    }
    async getAllFixesForTsCodeAction(document, file, diagnostic, tsAction) {
        const singleFix = this.getSingleFixForTsCodeAction(diagnostic, tsAction);
        const fixAll = await this.getFixAllForTsCodeAction(document, file, diagnostic, tsAction);
        return fixAll ? [singleFix, fixAll] : [singleFix];
    }
    getSingleFixForTsCodeAction(diagnostic, tsAction) {
        const codeAction = new vscode.CodeAction(tsAction.description, vscode.CodeActionKind.QuickFix);
        codeAction.edit = codeAction_1.getEditForCodeAction(this.client, tsAction);
        codeAction.diagnostics = [diagnostic];
        if (tsAction.commands) {
            codeAction.command = {
                command: ApplyCodeActionCommand.ID,
                arguments: [tsAction],
                title: tsAction.description
            };
        }
        return codeAction;
    }
    async getFixAllForTsCodeAction(document, file, diagnostic, tsAction) {
        if (!tsAction.fixId || !this.client.apiVersion.has270Features()) {
            return undefined;
        }
        // Make sure there are multiple diagnostics of the same type in the file
        if (!this.diagnosticsManager.getDiagnostics(document.uri).some(x => x.code === diagnostic.code && x !== diagnostic)) {
            return;
        }
        const action = new vscode.CodeAction(tsAction.fixAllDescription || localize(0, null, tsAction.description), vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.command = {
            command: ApplyFixAllCodeAction.ID,
            arguments: [file, tsAction],
            title: ''
        };
        return action;
    }
}
exports.default = TypeScriptQuickFixProvider;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/6a6e02cef0f2122ee1469765b704faf5d0e0d859/extensions/typescript-language-features/out/features/quickFixProvider.js.map
