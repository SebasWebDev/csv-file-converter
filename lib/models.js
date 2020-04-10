'use strict';

class RowData {
    constructor(header = '', content = '') {
        this.header = header;
        this.content = content;
    }
}

class CSVFileConverterOptions {
    constructor(filePath = '', format = 'txt', dest = './', split = false) {
        this.filePath = filePath;
        this.format = format;
        this.dest = dest;
        this.split = split;
    }
}

module.exports = {
    RowData,
    CSVFileConverterOptions
};
