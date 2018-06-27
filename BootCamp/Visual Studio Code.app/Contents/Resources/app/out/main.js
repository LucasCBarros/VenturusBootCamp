/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";function stripComments(e){return e.replace(/("(?:[^\\\"]*(?:\\.)?)*")|('(?:[^\\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g,function(e,r,n,t,a){if(t)return"";if(a){let e=a.length;return e>2&&"\n"===a[e-1]?"\r"===a[e-2]?"\r\n":"\n":""}return e})}function getCommit(){if(_commit)return _commit;if(null!==_commit){try{let e=require(path.join(__dirname,"../product.json"));_commit=e.commit?e.commit:null}catch(e){_commit=null}return _commit||void 0}}function mkdirp(e){return mkdir(e).then(null,r=>{if(r&&"ENOENT"===r.code){let r=path.dirname(e);if(r!==e)return mkdirp(r).then(()=>mkdir(e))}throw r})}function mkdir(e){return new Promise((r,n)=>{fs.mkdir(e,t=>{t&&"EEXIST"!==t.code?n(t):r(e)})})}function exists(e){return new Promise(r=>{fs.exists(e,e=>{r(e)})})}function readFile(e){return new Promise((r,n)=>{fs.readFile(e,"utf8",(e,t)=>{e?n(e):r(t)})})}function writeFile(e,r){return new Promise((n,t)=>{fs.writeFile(e,r,"utf8",e=>{e?t(e):n(void 0)})})}function touch(e){
return new Promise((r,n)=>{let t=new Date;fs.utimes(e,t,t,e=>{e?n(e):r(void 0)})})}function resolveJSFlags(){let e=[];return args["js-flags"]&&e.push(args["js-flags"]),args["max-memory"]&&!/max_old_space_size=(\d+)/g.exec(args["js-flags"])&&e.push(`--max_old_space_size=${args["max-memory"]}`),e.length>0?e.join(" "):null}function getUserDefinedLocale(){let e=args.locale;if(e)return Promise.resolve(e.toLowerCase());let r=app.getPath("userData"),n=path.join(r,"User","locale.json");return exists(n).then(e=>e?readFile(n).then(e=>{e=stripComments(e);try{let r=JSON.parse(e).locale;return r&&"string"==typeof r?r.toLowerCase():void 0}catch(e){return}}):void 0)}function getLanguagePackConfigurations(){let e=app.getPath("userData"),r=path.join(e,"languagepacks.json");try{return require(r)}catch(e){}}function resolveLanguagePackLocale(e,r){try{for(;r;){if(e[r])return r;{let e=r.lastIndexOf("-");if(!(e>0))return;r=r.substring(0,e)}}}catch(e){console.error("Resolving language pack configuration failed.",e)}}
function getNLSConfiguration(e){if("pseudo"===e)return Promise.resolve({locale:e,availableLanguages:{},pseudo:!0});if(process.env.VSCODE_DEV)return Promise.resolve({locale:e,availableLanguages:{}});let r=app.getPath("userData");if(e&&("en"==e||e.startsWith("en-")))return Promise.resolve({locale:e,availableLanguages:{}});let n=e;perf.mark("nlsGeneration:start");let t=function(e){let r=!0;if(e&&(r=["de","es","fr","it","ja","ko","ru","zh-cn","zh-tw"].some(r=>e===r||e.startsWith(r+"-"))),r){let r=function(e){for(;e;){let r=path.join(__dirname,"vs","code","electron-main","main.nls.")+e+".js";if(fs.existsSync(r))return{locale:n,availableLanguages:{"*":e}};{let r=e.lastIndexOf("-");e=r>0?e.substring(0,r):void 0}}}(e);return perf.mark("nlsGeneration:end"),Promise.resolve(r)}return perf.mark("nlsGeneration:end"),Promise.resolve({locale:e,availableLanguages:{}})};try{let n=getCommit();if(!n)return t(e);let a=getLanguagePackConfigurations();if(!a)return t(e);let o=e;if(!(e=resolveLanguagePackLocale(a,e)))return t(o)
;let i,s=a[e];return s&&"string"==typeof s.hash&&s.translations&&"string"==typeof(i=s.translations.vscode)?exists(i).then(a=>{if(!a)return t(e);let l=s.hash+"."+e,u=path.join(r,"clp",l),c=path.join(u,n),p=path.join(u,"tcf.json"),f={locale:o,availableLanguages:{"*":e},_languagePackId:l,_translationsConfigFile:p,_cacheRoot:u,_resolvedLanguagePackCoreLocation:c};return exists(c).then(r=>r?(touch(c).catch(()=>{}),perf.mark("nlsGeneration:end"),f):mkdirp(c).then(()=>Promise.all([readFile(path.join(__dirname,"nls.metadata.json")),readFile(i)])).then(e=>{let r=JSON.parse(e[0]),n=JSON.parse(e[1]).contents,t=Object.keys(r.bundles),a=[];for(let e of t){let t=r.bundles[e],o=Object.create(null);for(let e of t){let t,a=r.keys[e],i=r.messages[e],s=n[e];if(s){t=[];for(let e=0;e<a.length;e++){let r=a[e],n=s["string"==typeof r?r:r.key];void 0===n&&(n=i[e]),t.push(n)}}else t=i;o[e]=t}a.push(writeFile(path.join(c,e.replace(/\//g,"!")+".nls.json"),JSON.stringify(o)))}return a.push(writeFile(p,JSON.stringify(s.translations))),
Promise.all(a)}).then(()=>(perf.mark("nlsGeneration:end"),f)).catch(r=>(console.error("Generating translation files failed.",r),t(e))))}):t(e)}catch(r){return console.error("Generating translation files failed.",r),t(e)}}function getNodeCachedDataDir(){if(process.argv.indexOf("--no-cached-data")>0)return Promise.resolve(void 0);if(process.env.VSCODE_DEV)return Promise.resolve(void 0);let e=getCommit();if(!e)return Promise.resolve(void 0);return mkdirp(path.join(app.getPath("userData"),"CachedData",e)).then(void 0,function(){})}let perf=require("./vs/base/common/performance");perf.mark("main:started"),global.perfStartTime=Date.now(),Error.stackTraceLimit=100,function(){const e=require("path"),r=require("module"),n=e.join(__dirname,"../node_modules"),t=n+".asar",a=r._resolveLookupPaths;r._resolveLookupPaths=function(e,r,o){const i=a(e,r,o),s=o?i:i[1];for(let e=0,r=s.length;e<r;e++)if(s[e]===n){s.splice(e,0,t);break}return i}}()
;let _commit,app=require("electron").app,fs=require("fs"),path=require("path"),minimist=require("minimist"),paths=require("./paths"),args=minimist(process.argv,{string:["user-data-dir","locale"]}),userData=path.resolve(args["user-data-dir"]||paths.getDefaultUserDataPath(process.platform));app.setPath("userData",userData);try{"win32"===process.platform?(process.env.VSCODE_CWD=process.cwd(),process.chdir(path.dirname(app.getPath("exe")))):process.env.VSCODE_CWD&&process.chdir(process.env.VSCODE_CWD)}catch(e){console.error(e)}global.macOpenFiles=[],app.on("open-file",function(e,r){global.macOpenFiles.push(r)});let openUrls=[],onOpenUrl=function(e,r){e.preventDefault(),openUrls.push(r)};app.on("will-finish-launching",function(){app.on("open-url",onOpenUrl)}),global.getOpenUrls=function(){return app.removeListener("open-url",onOpenUrl),openUrls};let nodeCachedDataDir=getNodeCachedDataDir().then(function(e){if(e){process.env["VSCODE_NODE_CACHED_DATA_DIR_"+process.pid]=e;let r=resolveJSFlags()
;app.commandLine.appendSwitch("--js-flags",r?r+" --nolazy":"--nolazy")}return e}),nlsConfiguration=void 0,userDefinedLocale=getUserDefinedLocale();userDefinedLocale.then(e=>{e&&!nlsConfiguration&&(nlsConfiguration=getNLSConfiguration(e))});let jsFlags=resolveJSFlags();jsFlags&&app.commandLine.appendSwitch("--js-flags",jsFlags),app.once("ready",function(){perf.mark("main:appReady"),Promise.all([nodeCachedDataDir,userDefinedLocale]).then(e=>{let r=e[1];r&&!nlsConfiguration&&(nlsConfiguration=getNLSConfiguration(r)),nlsConfiguration||(nlsConfiguration=Promise.resolve(void 0)),nlsConfiguration.then(e=>{let r=e=>{process.env.VSCODE_NLS_CONFIG=JSON.stringify(e),require("./bootstrap-amd").bootstrap("vs/code/electron-main/main")};if(e)r(e);else{let e=app.getLocale();e?getNLSConfiguration(e=e.toLowerCase()).then(n=>{n||(n={locale:e,availableLanguages:{}}),r(n)}):r({locale:"en",availableLanguages:{}})}})},console.error)});
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/6a6e02cef0f2122ee1469765b704faf5d0e0d859/core/main.js.map