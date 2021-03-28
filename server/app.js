const express = require('express');
const app = express()
const http = require('http');
const request = require('request');
const path = require('path');
const mysql = require('mysql2');
const port = 3000;
const cors = require('cors')


app.use(cors())


http.createServer(app).listen(3000);


app.get('/', function(req, res){
    res.send("Sup")
})

const con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "K3v1nl1u",
    database: "underdog-player-db"
})

let url = "http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=baseball&response_format=JSON"

let options = {json: true};
let posSet = new Set();
let sportsSet = new Set(["baseball", "basketball", "football"]);
let queryResults = [];


request(url, options, (error, res, body) => {
    if (error){
        return console.log(error)
    };

    if (!error && res.statusCode==200){
        
        let playersList = body.body.players
        let posAgeHash = {}

        for(i = 0; i < playersList.length; i++){
            
            if ("age" in playersList[i]) {

                if (!(playersList[i].position in posSet)){
                    posSet.add(playersList[i].position)
                }

                if (!(playersList[i].position in posAgeHash)){
                    posAgeHash[playersList[i].position] = [playersList[i].age , 1]
                } else {
                    posAgeHash[playersList[i].position][0] += playersList[i].age
                    posAgeHash[playersList[i].position][1] += 1
                }
                con.connect(function(err){

                    if(err)throw err;
                    let sql = `INSERT INTO Players (name_brief,first_name,last_name,position,age,average_position_age_diff, createdAt, updatedAt) VALUES ("${playersList[i].firstname.charAt(0) + '. ' + playersList[i].lastname.charAt(0) + '.' }", "${playersList[i].firstname}", "${playersList[i].lastname}", "${playersList[i].position}", "${playersList[i].age}", 1, "${new Date().toISOString().slice(0, 19).replace('T', ' ')}", "${new Date().toISOString().slice(0, 19).replace('T', ' ')}")`;
    
                    con.query(sql, function(err, result) {
                        if(err) throw err;
                        
                    })
                })
            }

        }

        con.connect(function(err){

            if(err)throw err;

            console.log(posAgeHash);
            
            for (let key in posAgeHash){
                let sql = `UPDATE Players SET Players.average_position_age_diff = Players.age - ${posAgeHash[key][0]/posAgeHash[key][1]} WHERE position like '${key}';`
                
                con.query(sql, function(err, result) {
                    if(err) throw err;
                })
            }
            
        
        })


        console.log(String(i) + " entries added.");
    };
});


const buildSearchParams = (searchInput) => {
    console.log("buildSearchParams");
    

    let str = searchInput;

    str = str.replace(',', ' ');
    //str = str.replace(',', ' ');

    searchArr = str.split(' ');

    let attrHash = {"sport": "", "lastNameFirstLtr": "", "age": -1, "age-min": -1, "age-max": -1, "position":""};

    for (i= 0; i < searchArr.length; i++) {
        if (!isNaN(searchArr[i])){
            attrHash["age"] = parseInt(searchArr[i]);
        } else if (!isNaN(searchArr[i].split('-')[0]) && !isNaN(searchArr[i].split('-')[1])){
            attrHash["age-min"] = parseInt(searchArr[i].split('-')[0]);
            attrHash["age-max"] = parseInt(searchArr[i].split('-')[1]);
        } else if (searchArr[i] in posSet) {
            // might neeed a query that switches position and Lname first ltr and return both
            attrHash["position"] = searchArr[i];
            if (searchArr[i].length == 1){
                attrHash["lastNameFirstLtr"] = seachArr[i];
            }
        } else if (searchArr[i].length == 1) {
            attrHash["lastNameFirstLtr"] = searchArr[i];
        } else if (searchArr[i] in sportsSet) {
            attrHash["sport"] = searchArr[i];
        }
    }

    return attrHash
}

const buildQuery = (attrHash) => {

    console.log("build query...");
    console.log(attrHash);

    // special cases:
    // first ltr last name / position conflicts
        // first ltr of last name is a position
        // position is first ltr of last name
    // both age and age range is specified
        // age outside age range is specified
            // run query with range, and with individual age
        // age inside age range is specified
            // ignore age


    sql  = `SELECT * from Players WHERE `

    if(attrHash["age-min"] != -1 && attrHash["age-max"] != -1 && attrHash["age"] != -1){
        if (attrHash["age"] <= attrHash["age-max"] && attrHash["age"] >= attrHash["age-min"]){
            delete attrHash["age"];
        } 
    }

    ind = 0
    for (let key in attrHash){

        if ((typeof attrHash[key] === "number" && attrHash[key] >= 0) ||(typeof attrHash[key] === "string" && attrHash[key].length > 0)){

        

            let addSql = "";
            if (ind > 0 && ind < attrHash.length - 1){
                sql += " AND"
            }


            switch(key) {
                case "age":
                    addSql = `age = ${attrHash[key]}`;
                    break;

                case "age-min":
                    addSql = `age >= ${attrHash[key]}`;
                    break;

                case "age-max":
                    addSql = `age <= ${attrHash[key]}`;
                    break;

                case "lastNameFirstLtr":
                    
                    addSql = `SUBSTRING(last_name, 0, 1) like "${attrHash[key]}"`;
                    
                    break;

                case "position":
                    
                    addSql = `position like "${attrHash[key]}"`
                    break;
                /*
                case "sport":
                    addSql = `sport like ${attrHash[key]}`
                    break;
                */
            }

            sql += addSql;
            ind += 1;
        }

    }

    sql += ';';

    /*
    SELECT * from Players WHERE SUBSTRING(last_name, 0, 1) like ""age = 30age >= -1age <= -1position like ""
    */
    console.log(sql);
    return sql

}

const getResults = (query) => {

    console.log("get results....")

    //let queryResults = [];



    con.connect(function(err){
    
        if(err)throw err;

        con.query(sql, function(err, result) {
            if(err) throw err;
            
            queryResults = result;

        })
        
    })

    console.log(queryResults);


    /*
    request(url, options, (error, res, body) => {
        if (error){
            return console.log(error)
        };
    
        if (!error && res.statusCode==200){
            
            con.connect(function(err){
    
                if(err)throw err;
    
                con.query(sql, function(err, result) {
                    if(err) throw err;
                    queryResults = res;
                    //console.log(queryResults);
                })
                
            })
    
            console.log(queryResults);
        };
    });
    */
    
    /*
    console.log(queryResults);
    if (queryResults.length > 0){
        return queryResults
    }
    */
   
    if (queryResults.length === 0) {
        return ["No matching results found."];
    }
    return queryResults;
    
    
}

const runSearch = (search) => {

    console.log("run search...");
  
    if (typeof search !== 'undefined'){
        console.log("in if statement");
        let searchHash = {};
        searchHash = buildSearchParams(search);
        
        let sqlQuery = buildQuery(searchHash);
        searchResults = getResults(sqlQuery);
        console.log(searchResults);
        return searchResults
    } else{
        //console.log("empty search?");
        return "";
    }
    

}


app.get('/searchPlayer', function(req, res){
    
    //res.send(() => {console.log(req.body)});

    let results = runSearch(req.query.query);
   //console.log(results);
    res.send(results);

    // call a function that runs sql queries using attrHash
        // function should return data/json/whatever
    
    //send to response
    // res.send(datafrom sqlquery function)
    
})


/*
app.post('/searchPlayer', function(req, res){

})
*/