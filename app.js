const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

const viewsDirectory = path.join(__dirname, 'views');

const mysql = require('mysql2');
let host = '';
let user = '';
let password = '';
let dbName = '';
let db;


const datasetTypesOptions = [
    //{ value: 'FUNCTION', label: 'Functions' },
    { value: 'PROCEDURE', label: 'Stored Procedures' },
    { value: 'VIEW', label: 'Views' },
];

app.get('/getDBconnectionData/:hostData/:userData/:passwordData/:dbNameData', req => {
    host = req.params.hostData;
    user = req.params.userData;
    password = req.params.passwordData;
    dbName = req.params.dbNameData;

    db = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: dbName
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });
})


app.use(express.static('views'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//sending data to html
app.get('/getDataSetTypes', (req, res) => {
    res.json(datasetTypesOptions);
});

app.get('/getDataSetTypes/:DataSetType', (req,res) => {
    const chosenType = req.params.DataSetType;
    console.log(`Selected data type: ${req.params.DataSetType}`);
    let query = '';
    switch(chosenType)
    {
        case 'PROCEDURE':
        case 'FUNCTION':
            query = `SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'chartproject' AND ROUTINE_TYPE = '${chosenType}';`;
            break;
        case 'VIEW':
            query = `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = \'chartproject\' AND TABLE_TYPE = '${chosenType}';`;
            break;
        default:
            console.log("Invalid type");
    }
    db.query(query, (err, results) => {
        if(err){
            console.error('Error selecting list of chosen data type from db :', err);
            return;
        }
        console.log('Selected data:', results);
        res.json(results);
    })
})

app.get('/getDataSetTypes/:DataSetType/:DataSet', (req,res) => {
    const chosenType = req.params.DataSetType;
    const chosenName = req.params.DataSet;
    console.log(`Selected data type: ${req.params.DataSetType}`);
    console.log(`Selected name: ${req.params.DataSet}`);
    let query = '';
    switch(chosenType)
    {
        case 'PROCEDURE':
            query = `CALL ${chosenName}();`;
            break;
        case 'VIEW':
            query = `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'chartproject' AND TABLE_NAME = '${chosenName}'`;
            break;
        case 'FUNCTION':
            //???
            break;
        default:
            console.log("Invalid type");
    }
    db.query(query, (err, results) => {
        if(err){
            console.error('Error selecting name from db :', err);
            return;
        }
        console.log('Selected data:', results);
        switch (chosenType){
            case 'PROCEDURE':
                //TODO: check if results is empty or not an array
                if (!results)
                    throw new Error("Sp didn't return anything");
                if (results.length < 1)
                    throw new Error("Sp didn't return records, can't find properties");
                return res.json( Object.keys(results[0][0]));
                break;
            default: return res.json(results);
        }

        res.json(results);
    })
})

app.get('/getDataSetTypes/:DataSetType/:DataSet/:DataSetData', (req, res) =>  {
    const chosenType = req.params.DataSetType;
    const chosenName = req.params.DataSet;
    console.log(`Selected data type: ${req.params.DataSetType}`);
    console.log(`Selected name: ${req.params.DataSet}`);
    let query = '';
    switch(chosenType)
    {
        case 'PROCEDURE':
            query = `CALL ${chosenName}();`;
            break;
        case 'VIEW':
            query = `SELECT * FROM ${chosenName};`;
            break;
        case 'FUNCTION':
            query = `SELECT ${chosenName}();`;
            break;
        default:
            console.log("Invalid type");
    }
    db.query(query, (err, results) => {
        if(err){
            console.error('Error selecting name from db :', err);
            return;
        }
        console.log('Selected data x,y:', results);
        switch (chosenType){
            case 'PROCEDURE':
                return res.json(results[0]);
            default:
                break;
        }
        res.json(results);
    })
})



// Set EJS as the template engine
//app.set('view engine', 'ejs');

// Specify the directory where your views/templates are located
//app.set('views', viewsDirectory);