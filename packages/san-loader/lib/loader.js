/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file loader main
 * @author clark-t
 */

const qs = require('querystring');
const parse = require('./utils/parse');
const {
    generateTemplateImport,
    getTemplateCode
} = require('./blocks/template');
const {
    generateScriptImport,
    getScriptCode
} = require('./blocks/script');
const {
    generateStyleImport,
    getStyleCode
} = require('./blocks/style');

/**
 * runtime 模块路径
 *
 * @type {string}
 */
const normalizePath = require.resolve('./runtime/normalize');

/**
 * San 单文件有效的标签块及其代码提取方法集合
 *
 * @const
 * @type {Object}
 */
const SAN_BLOCK_MAP = {
    template: getTemplateCode,
    script: getScriptCode,
    style: getStyleCode
};

/**
 * San 有效的标签块列表
 *
 * @const
 * @type {Array.<string>}
 */
const SAN_TAGNAMES = Object.keys(SAN_BLOCK_MAP);

/**
 * 根据参数从 San 单文件中获取标签块中代码的方法
 *
 * @param {Object} descriptor 分类好的代码块描述对象
 * @param {Object} options 参数
 * @return {Object} {code, map}
 */
function extract(descriptor, options) {
    let extractor = SAN_BLOCK_MAP[options.query.type];
    return extractor(descriptor, options);
}

module.exports = function (source) {
    const {descriptor, ast} = parse(source, SAN_TAGNAMES);
    const rawQuery = this.resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    const options = {
        source: source,
        resourcePath: this.resourcePath,
        needMap: this.sourceMap,
        query: query,
        ast: ast
    };
    // 根据 type 等参数指定返回不同的代码块
    if (query && query.san === '' && query.type) {
        let {code, map} = extract(descriptor, options);
        if (this.sourceMap) {
            this.callback(null, code, map);
        }
        else {
            this.callback(null, code);
        }
        return;
    }
    // 生成入口文件
    let templateCode = generateTemplateImport(descriptor, options);
    let styleCode = generateStyleImport(descriptor, options);
    let scriptCode = generateScriptImport(descriptor, options);

    let codo = `
        import normalize from '${normalizePath}';
        ${styleCode}
        ${templateCode}
        ${scriptCode}
        export default normalize(script, template, injectStyles);
        /* san-hmr component */
    `;
    this.callback(null, codo);
};

