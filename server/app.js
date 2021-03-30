const express = require('express');
const app = express()
const http = require('http');
const request = require('request');
const path = require('path');
const mysql = require('mysql2');
const port = 3000;
const cors = require('cors');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');


app.use(cors())


http.createServer(app).listen(3000);


app.get('/', function(req, res){
    res.send("Server running...")
})

const con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "K3v1nl1u",
    database: "underdog-player-db"
})

let urls = ["http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=baseball&response_format=JSON", "http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=basketball&response_format=JSON", "http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=football&response_format=JSON"];

let options = {json: true};
let posSet = new Set();
let sportsSet = new Set(["baseball", "basketball", "football"]);


for (s = 0; s < urls.length; s++){
  
    request(urls[s], options, (error, res, body) => {
        if (error){
            return console.log(error)
        };
    
        if (!error && res.statusCode==200){
            
            let playersList = body.body.players
            let posAgeHash = {}
            let sport;
    
            for(i = 0; i < playersList.length; i++){
                
                if ("age" in playersList[i]) {

                    if (!sport){
                        if ("photo" in playersList[i]){
                            let deconLink = playersList[i].photo.split('/');
                            let linkSet = new Set(deconLink);
                            if( linkSet.has("baseball")) {
                                sport = "baseball";
                            } else if (linkSet.has("basketball")){
                                sport = "basketball";

                            } else if (linkSet.has("football")){
                                sport = "football";
                            }
                            
                        }
                    }
    
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
                        
                        //console.log(s);
                        //let sql = "";
                        if(err)throw err;
                        if (sport === "baseball") {
                            sql = `INSERT INTO Players (name_brief,first_name,last_name,position,age,average_position_age_diff, createdAt, updatedAt) VALUES ("${playersList[i].firstname.charAt(0) + '. ' + playersList[i].lastname.charAt(0) + '.' }", "${playersList[i].firstname}", "${playersList[i].lastname}", "${playersList[i].position}", "${playersList[i].age}", 1, "${new Date().toISOString().slice(0, 19).replace('T', ' ')}", "${new Date().toISOString().slice(0, 19).replace('T', ' ')}")`;
                        } else if (sport === "basketball") {
                            sql = `INSERT INTO Players (name_brief,first_name,last_name,position,age,average_position_age_diff, createdAt, updatedAt) VALUES ("${playersList[i].firstname + ' ' + playersList[i].lastname.charAt(0) + '.' }", "${playersList[i].firstname}", "${playersList[i].lastname}", "${playersList[i].position}", "${playersList[i].age}", 1, "${new Date().toISOString().slice(0, 19).replace('T', ' ')}", "${new Date().toISOString().slice(0, 19).replace('T', ' ')}")`;
                        } else if (sport === "football") {
                            sql = `INSERT INTO Players (name_brief,first_name,last_name,position,age,average_position_age_diff, createdAt, updatedAt) VALUES ("${playersList[i].firstname.charAt(0) + '. ' + playersList[i].lastname }", "${playersList[i].firstname}", "${playersList[i].lastname}", "${playersList[i].position}", "${playersList[i].age}", 1, "${new Date().toISOString().slice(0, 19).replace('T', ' ')}", "${new Date().toISOString().slice(0, 19).replace('T', ' ')}")`;
                        }

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

}


const buildSearchParams = (searchInput) => {
    console.log("buildSearchParams");

    console.log(posSet);
    
    let str = searchInput;
    str = str.replace(',', ' ');
    searchArr = str.split(' ');

    console.log(searchArr);

    let attrHash = {"sport": "", "lastNameFirstLtr": "", "age": -1, "age-min": -1, "age-max": -1, "position":""};

    for (i= 0; i < searchArr.length; i++) {
        if(searchArr[i]){
            if (!isNaN(searchArr[i])){
                attrHash["age"] = parseInt(searchArr[i]);
            } else if (!isNaN(searchArr[i].split('-')[0]) && !isNaN(searchArr[i].split('-')[1])){
                attrHash["age-min"] = parseInt(searchArr[i].split('-')[0]);
                attrHash["age-max"] = parseInt(searchArr[i].split('-')[1]);
            } else if (posSet.has(searchArr[i])) {
                // might neeed a query that switches position and Lname first ltr and return both
                console.log("valid position!");
                if (attrHash["position"].length > 0){
                    attrHash["position"] += `,${searchArr[i]}`;
                } else {
                    attrHash["position"] = searchArr[i];
                }
                if (searchArr[i].length === 1){
                    if (attrHash["lastNameFirstLtr"].length > 0){
                        attrHash["lastNameFirstLtr"] += `,${searchArr[i]}`;
                    } else{               
                        attrHash["lastNameFirstLtr"] = searchArr[i];
                    }
                }
            } else if (searchArr[i].length === 1) {
                if (attrHash["lastNameFirstLtr"].length > 0){
                    attrHash["lastNameFirstLtr"] += `,${searchArr[i]}`;
                } else{
                    attrHash["lastNameFirstLtr"] = searchArr[i];
                }
            } else if (sportsSet.has(searchArr[i])) {
                attrHash["sport"] = searchArr[i];
            }
        }
    }

    return attrHash
}

const buildQuery = (attrHash) => {

    console.log("build query...");
    console.log(attrHash);

    sql  = `SELECT * from Players WHERE `

    if(attrHash["age-min"] != -1 && attrHash["age-max"] != -1 && attrHash["age"] != -1){
        if (attrHash["age"] <= attrHash["age-max"] && attrHash["age"] >= attrHash["age-min"]){
            delete attrHash["age"];
        } 
    }

    let sortedKeys = Object.keys(attrHash).sort();
    console.log(sortedKeys);
    ind = 0
    let ageIndRange = false;
    let sameLnPos = false;
    for (i = 0; i < sortedKeys.length; i++){

        if ((typeof attrHash[sortedKeys[i]] === "number" && attrHash[sortedKeys[i]] >= 0) ||(typeof attrHash[sortedKeys[i]] === "string" && attrHash[sortedKeys[i]].length > 0)){

            let addSql = "";
            if (ind > 0 && ind < Object.keys(attrHash).length - 1){
                
                if((ageIndRange && prev === "age-min")){
                    sql += ')';
                }

                if(sortedKeys[i] === "age-max" && prev === "age"){
                    sql += " OR "
                    sql = sql.slice(0, sql.indexOf("age")) + '(' + sql.slice(sql.indexOf("age"), sql.length);
                    ageIndRange = true;
                } else if(sortedKeys[i] === "position" && prev === "lastNameFirstLtr" && attrHash["position"] === attrHash["lastNameFirstLtr"]){

                    sql = sql.slice(0, sql.indexOf("SUBSTRING(last_name")) + "(" + sql.slice(sql.indexOf("SUBSTRING(last_name"),sql.length);
                    sql += " OR ";
                    sameLnPos = true;
                    
                }
                else {
                    sql += " AND "
                }
            }

            switch(sortedKeys[i]) {
                case "age":
                    addSql = `(age = ${attrHash[sortedKeys[i]]})`;
                    break;

                case "age-min":
                    addSql = `age >= ${attrHash[sortedKeys[i]]})`;
                    break;

                case "age-max":
                    addSql = `(age <= ${attrHash[sortedKeys[i]]}`;
                    break;

                case "lastNameFirstLtr":
                    
                    if (attrHash[sortedKeys[i]].length > 1){
                        addSql = "(";
                        ltrs = attrHash[sortedKeys[i]].split(',');
                        for (x = 0; x < ltrs.length; x++){
                            addSql += `SUBSTRING(last_name, 1, 1) like "${ltrs[x]}"`;
                            if (x < ltrs.length - 1){
                                addSql += " OR ";
                            }
                        }
                        addSql += ")";
                        
                    } else {
                        addSql = `SUBSTRING(last_name, 1, 1) like "${attrHash[sortedKeys[i]]}"`;
                    }
                    
                    break;

                case "position":
                    if (attrHash[sortedKeys[i]].length > 1){
                        addSql = "(";
                        positions = attrHash[sortedKeys[i]].split(',');
                        for (x=0; x < positions.length; x++){
                            addSql+= `position like "${positions[x]}"`;
                            if(x < positions.length - 1){
                                addSql += " OR "
                            }
                        }
                        addSql += ")";
                    } else {
                        addSql = `position like "${attrHash[sortedKeys[i]]}"`
                    }

                    break;

            }

            sql += addSql;
            ind += 1;
            prev = sortedKeys[i];

        }

    }

    if (sameLnPos || (ageIndRange) && prev === "age-min"){
        sql += ')';
    }

    sql += ';';

    console.log(sql);
    return sql

}



app.get('/searchPlayer', function(req, res){

    search = req.query.query;
    if (search){
        let searchHash = {};
        searchHash = buildSearchParams(search);
        let sqlQuery = buildQuery(searchHash);
        con.connect(function(err){
    
            if(err)throw err;
    
            con.query(sqlQuery, function(err, result) {
                if(err) throw err;
                
                //queryResults = result;
    
                res.send(result);
                console.log(result);
    
            })
            
        })

    } else {
        res.send("Empty Search");
    }

    
})
