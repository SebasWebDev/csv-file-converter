# CSV File Converter

Transform a CSV file to TXT, DOCX or multiple CSV files.

## Usage
Usage: 
```
csv-file-converter [-p | --path <filepath>] [-d | --dest <destination of outpu>]
                                    [-s | --split <true | false>] [-f | --format <file output format>]
```

OPTIONS:

    -p, --path
        The path of the CSV file to convert
    
    -d, --dest
        The destination path for the output file. Default: ./<format>.format
        
    -s, --split
        If true, each line of the csv file will be in an individual file. Default: false
        
    -f, --format
        Any of the file formats of the following: txt, csv, doc. Default: txt.
        Note: csv will change the --split option to true and will generate individual files for each row.
    
    -h, --help
        Shows usage

