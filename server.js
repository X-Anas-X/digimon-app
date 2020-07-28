'use strict';
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const client = new pg.Client(process.env.DATABASE_URL)

app.use(cors());
app.use(express.static('/public'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');




//***********************routes******* */
app.get('/', homeHandler);
app.get('/details/detail_id', detailHandler);
app.get('/favorite', favoriteHandler);
app.get('/add', addHandler);
app.put('/update/:update_id', updateHandler);
app.delete('/delete/:delete_id', deleteHandler);

//*************************functions************** */

function homeHandler(req, res){

    const url = `https://digimon-api.herokuapp.com/api/digimon`
    superagent.get(url)
    .then((data)=>{
        let newDigi = data.body.map(val =>{
        return new Digimon(val);
    });
    res.render('./index', {digimonForm: newDigi})
})
.catch((err)=>{
    errHandler(err, req, res);
})

}

function detailHandler(req,res){
    let SQL = 'SELECT * FROM digi;';
    client.query(SQL)
    .then((result) =>{
        res.render('./digi/details', {data: result.rows})
    })
    .catch((err)=>{
        errHandler(err, req, res);
    })

}


function favoriteHandler(req, res){
    let param = req.params.detail_id;
    let SQL = "SELECT * FROM digi WHERE id=$1;";
    let safeValues = [param];
    client.query(SQL, safeValues)
    .then((result) =>{
        res.render('./digi/details', {data: result.rows[0]})
    })
    .catch((err)=>{
        errHandler(err, req, res);
    })

}

function addHandler(req, res){
    let {name, img, level} = req.query;
    let SQL = 'INSERT INTO digi (name,img,value) VALUES ($1,$2,$3)'
    let safeValues = [name, img, level];
    client.query(SQL, safeValues)
    .then(()=>{
        res.redirect('/selectData');
    })
    .catch((err)=>{
        errHandler(err, req, res);
    })


}

function updateHandler(req, res){
    let param = req.params.update_id;
    let SQL = `UPDATE digi set (name=$1,img=$2,level=$3 WHERE id=$4);`;
    let safeValues = [name, img, level, param];
    client.query(SQL, safeValues)
    .then(() =>{
        res.redirect(`/details/${param}`)
    })
    .catch((err)=>{
        errHandler(err, req, res);
    })


}

function deleteHandler (req,res){
    let param = req.params.delete_id;
    let SQL = `DELETE FROM digi WHERE id=$1;`;
    let safeValues = [param];
    client.query(SQL, safeValues)
    .then(()=>{
        res.redirect('/details')
    })
    .catch((err)=>{
        errHandler(err, req, res);
    })


}


// *********************** constructor ****************//

function Digimon (val){
    this.name = val.name;
    this.img = val.img;
    this.level = val.level;
}


//***************************** listener **************/
client
.connect()
.then(()=>{ app.listen(PORT, () =>{
    console.log(`listening to ${PORT}`);
})
 
})

function errHandler (err, req, res){
    res.status(500).send(err);
}
