"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const vscode_1 = require("vscode");
class RelativeWorkspacePathResolver {
    asAbsoluteWorkspacePath(relativePath) {
        for (const root of vscode_1.workspace.workspaceFolders || []) {
            const rootPrefixes = [`./${root.name}/`, `${root.name}/`, `.\\${root.name}\\`, `${root.name}\\`];
            for (const rootPrefix of rootPrefixes) {
                if (relativePath.startsWith(rootPrefix)) {
                    return path.join(root.uri.fsPath, relativePath.replace(rootPrefix, ''));
                }
            }
        }
        return undefined;
    }
}
exports.RelativeWorkspacePathResolver = RelativeWorkspacePathResolver;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/6a6e02cef0f2122ee1469765b704faf5d0e0d859/extensions/typescript-language-features/out/utils/relativePathResolver.js.map
