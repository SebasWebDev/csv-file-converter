'use strinc';
const path = require('path');
const convertCSV = require('./lib/csv-converter');

const optionsMap = {
    'file-path': {
        type: 'string',
        params: ['-p', '--path']
    },
    split: {
        type: 'boolean',
        params: ['-s', '--split']
    },
    dest: {
        type: 'string',
        params: ['-d', '--dest']
    },
    format: {
        type: 'enum',
        values: ['txt', 'csv', 'docx'],
        default: 'txt',
        params: ['-f', '--format']
    }
};

const defaults = {
    split: false,
    dest: './',
    format: 'txt'
};

class CSVFileConverter {
    constructor(args) {
        this.options = Object.assign({}, defaults);
        this.init(args);
    }

    init(args) {
        this.formatArgs(args);
        this.convertCSV();
    }

    formatArgs(args) {
        let isParam = false;
        let lastOption = '';
        const options = {};
        if (args.length === 3 && args[2] === '--help') {
            this.displayHelp();
            return;
        } else {
            for (let i = 2; i < args.length; i++) {
                // The first param if not param type, is the file path
                if (i === 2 && args[i].charAt(0) !== '-') {
                    options['file-path'] = args[i];
                } else if (args[i].charAt(0) === '-' && !isParam) {
                    const key = Object.keys(optionsMap).find((param) => optionsMap[param].params.includes(args[i]));
                    if (!key) {
                        throw TypeError(`Unknown option ${args[i]}`);
                    }
                    options[key] = null;
                    lastOption = key;
                    isParam = true;
                } else if (isParam && lastOption) {
                    if (optionsMap[lastOption].type === 'enum' && !optionsMap[lastOption].values.includes(args[i])) {
                        throw TypeError(
                            `Unknown value '${args[i]}' for option ${lastOption}. Possible values are ${optionsMap[lastOption].values.join(' or ')}.`
                        );
                    }
                    if (optionsMap[lastOption].type === 'boolean') {
                        if (!['true', 'false'].includes(args[i])) {
                            throw TypeError(
                                `Unknown value '${args[i]}' for option ${lastOption}. Possible values are true or false.`
                            )
                        }
                        options[lastOption] = args[i] === 'true';
                    } else if (lastOption === 'dest') {
                        options[lastOption] = path.resolve(args[i]);
                    } else {
                        options[lastOption] = args[i];
                    }
                    lastOption = '';
                    isParam = false;
                } else {
                    throw TypeError('Missing value for option ' + lastOption);
                }

            }
        }
        if (options.format === 'csv') {
            options.split = true;
        }

        this.mergeOptions(options);
    }

    mergeOptions(options) {
        Object.keys(options).forEach((opt) => {
            this.options[opt] = options[opt];
        });
    }

    convertCSV() {
        if (this.options['file-path'].substr(-4).toLowerCase() !== '.csv') {
            throw TypeError('Incorrect source file format provided');
        }

        convertCSV(this.options).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.error(err);
        })
    }

    displayHelp() {
        const help = `
Usage: node /path/to/csv-manager.js [-p | --path <filepath>] [-d | --dest <destination of outpu>]
                                    [-s | --split <true | false>] [-f | --format <file output format>]

OPTIONS:
    -p, --path
        The path of the CSV file to convert
    
    -d, --dest
        The destination path for the output file. Default: ./
        
    -s, --split
        If true, each line of the csv file will be in an individual file. Default: false
        
    -f, --format
        Any of the file formats of tqhe following: txt, csv, doc. Default: txt.
        Note: csv will change the --split option to true and will generate individual files for each row.
    
    -h, --help
        Shows usage
    `;

        console.log(help);
    }
}

new CSVFileConverter(process.argv);

