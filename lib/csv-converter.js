'use strict';

const fs = require('fs');
const htmlDocx = require('html-docx-js');

let lastNameUsed = '';
let index = 0;

function convertCSV(options) {
    let resolve, reject;
    const result = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    fs.readFile(options['file-path'], 'utf8', (err, data) => {
        if (err) {
            console.error('Error accessing path', err);
            reject(err.message);
        } else {
            console.log(`File found for path: ${options['file-path']}`);
            const parse = parseContent(data, options);
            if (parse) {
                resolve(parse);
            }
        }
    });

    return result;
}

const parseContent = (content, options) => {
    if (content) {
        content = content.replace(/[\r\t]/gm, '');
        const lines = content.split('\n');
        // headers will be the first line;
        let headers;
        if (lines.length) {
            const rows = lines.reduce((arr, line, index) => {
                const columns = line.split(',');
                if (index === 0) {
                    headers = columns;
                    return arr;
                }

                arr.push(columns.map((body, i) => {
                    return {
                        header: headers[i],
                        content: body
                    }
                }));

                return arr;
            }, []);

            generateFiles(rows, options);

        }
    }
};

const generateFiles = (rows, options) => {
    if (options.split) {
        rows.forEach((row) => {
            printFile(row, options);
        })
    } else {
        printFile(rows, options);
    }
};

const printFile = (rows, options) => {
    if (rows) {
        let output = prepareContent(rows, options);
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
                fs.writeFile(`${options.dest}/${fileName}`, output, (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`${fileName} successfully created`);
                    }
                })
            }
        });
    }
};

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
