/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function pushAll(to, from) {
    if (from) {
        for (var i = 0; i < from.length; i++) {
            to.push(from[i]);
        }
    }
}
exports.pushAll = pushAll;
function contains(arr, val) {
    return arr.indexOf(val) !== -1;
}
exports.contains = contains;
/**
 * Like `Array#sort` but always stable. Usually runs a little slower `than Array#sort`
 * so only use this when actually needing stable sort.
 */
function mergeSort(data, compare) {
    _divideAndMerge(data, compare);
    return data;
}
exports.mergeSort = mergeSort;
function _divideAndMerge(data, compare) {
    if (data.length <= 1) {
        // sorted
        return;
    }
    var p = (data.length / 2) | 0;
    var left = data.slice(0, p);
    var right = data.slice(p);
    _divideAndMerge(left, compare);
    _divideAndMerge(right, compare);
    var leftIdx = 0;
    var rightIdx = 0;
    var i = 0;
    while (leftIdx < left.length && rightIdx < right.length) {
        var ret = compare(left[leftIdx], right[rightIdx]);
        if (ret <= 0) {
            // smaller_equal -> take left to preserve order
            data[i++] = left[leftIdx++];
        }
        else {
            // greater -> take right
            data[i++] = right[rightIdx++];
        }
    }
    while (leftIdx < left.length) {
        data[i++] = left[leftIdx++];
    }
    while (rightIdx < right.length) {
        data[i++] = right[rightIdx++];
    }
}
function binarySearch(array, key, comparator) {
    var low = 0, high = array.length - 1;
    while (low <= high) {
        var mid = ((low + high) / 2) | 0;
        var comp = comparator(array[mid], key);
        if (comp < 0) {
            low = mid + 1;
        }
        else if (comp > 0) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }
    return -(low + 1);
}
exports.binarySearch = binarySearch;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/6a6e02cef0f2122ee1469765b704faf5d0e0d859/extensions/html-language-features/server/out/utils/arrays.js.map
