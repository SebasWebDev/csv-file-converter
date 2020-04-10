'use strict';

const fs = require('fs');
const htmlDocx = require('html-docx-js');
const {CSVFileConverterOptions, RowData} = require('./models');
let lastNameUsed = '';
let index = 0;

/**
 * Reads the csv file to parse and generates the required files.
 *
 * @param options {CSVFileConverterOptions}
 * @return {Promise<string>}
 */
function convertCSV(options) {
    let resolve, reject;
    const result = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    fs.readFile(options.filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error accessing path', err);
            reject(err.message);
        } else {
            console.log(`File found for path: ${options.filePath}`);
            parseContent(data, options).then((success) => resolve(success))
                .catch(err => reject(err));
        }
    });

    return result;
}

/**
 *
 * @param content {string}
 * @param options {CSVFileConverterOptions}
 * @Return {Promise<string>}
 */
const parseContent = (content, options) => {
    if (content) {
        content = content.replace(/[\r\t]/gm, '');
        const lines = content.split('\n');
        // headers will be the first line;
        let headers = [];
        if (lines.length) {
            const rows = lines.reduce((arr, line, index) => {
                const columns = line.split(',');
                if (index === 0 && lines.length > 1) {
                    headers = columns;
                    return arr;
                }

                arr.push(columns.map((body, i) => {
                    return new RowData(headers[i], body);
                }));

                return arr;
            }, []);

            return generateFiles(rows, options);
        }

        return Promise.reject('Empty CSV file');
    }
    return Promise.reject('Empty CSV file');
};

/**
 *
 * @param rows {RowData[][]}
 * @param options {CSVFileConverterOptions}
 * @return {Promise<string>}
 */
const generateFiles = (rows, options) => {
    let resolve, reject;
    const result = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    const cb = (err) => {
        if (err) {
            reject(err.message);
        } else {
            resolve('Success!');
        }
    };
    if (options.split) {
        console.log(`${rows.length} files will be created`);
        rows.forEach((row) => {
            createFile(row, options, cb);
        })
    } else {
        createFile(rows, options, cb);
    }

    return result;
};

/**
 *
 * @param rows {RowData[]|RowData[][]}
 * @param options {CSVFileConverterOptions}
 * @param callback {Function}
 */
const createFile = (rows, options, callback) => {
    if (rows) {
        let output = prepareContent(rows, options);
        console.log('Files will be saved in ' + options.dest);
        fs.mkdir(options.dest, {recursive: true}, err => {
            if (err) {
                console.error(err.message);
            } else {
                const baseName = `${options.format.toUpperCase()}-${new Date().getTime()}`;
                let fileName = '';
                if (!lastNameUsed || baseName !== lastNameUsed) {
                    fileName = `${baseName}.${options.format}`;
                    lastNameUsed = baseName;
                    index = 0;
                } else {
                    fileName = `${baseName}-${index}.${options.format}`;
                    index++;
                }
                if (options.format === 'docx') {
                    output = htmlDocx.asBlob(output);
                }
                fs.writeFile(`${options.dest}/${fileName}`, output, (err, data) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`${fileName} successfully created`);
                    }
                    if (callback) {
                        callback(err)
                    }
                })
            }
        });
    }
};

/**
 * Format the generated rows
 * @param rows {RowData[]|RowData[][]}
 * @param options {CSVFileConverterOptions}
 * @return {string}
 */
const prepareContent = (rows, options) => {
    let output = '';
    if (rows) {
        if (options.format === 'csv') {
            output = rows.map((row) => row.header || '').join(',') + '\n' +
                rows.map((row) => row.content || '').join(',');
        } else {
            const addContent = (column) => {
                let content = '';
                if (options.format !== 'txt') {
                    if (column.header) {
                        content = `${content}<h3>${column.header}</h3><br /><br />`;
                    }
                    if (column.content) {
                        content = `${content}<p>${column.content}</p><br /><br />`;
                    }
                    content = `${content}<hr /><br /><br />`;
                } else {
                    if (column.header) {
                        content = `${content}${column.header}\n\n`;
                    }
                    if (column.content) {
                        content = `${content}${column.content}\n\n`;
                    }
                    content = `${content}-----------------------------------------------------\n\n\n`
                }
                return content;
            };
            rows.forEach((row) => {
                if (Array.isArray(row)) {
                    output = output + prepareContent(row, options);
                } else {
                    output = output + addContent(row);
                }
            });
        }
    }

    return output;
};

module.exports = convertCSV;
