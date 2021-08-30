var express = require('express');
var path = require('path');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fileUpload = require('express-fileupload');
const url = require('url');
const { isLoggedIn } = require('../helpers/util')
router.use(fileUpload())
module.exports = function (pool) {

    router.get('/coordinate', (req, res) => {
        var sql = "SELECT * FROM iklan koordinat";
        // console.log(sql)
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal')
            } else {
                res.json({
                    data: result.rows
                })
            }
        })
    })



    router.post('/upload', function (req, res) {
        var { alamat, harga, luas_tanah, koordinat, id_users, kota, kategori, kamar, isNego } = req.body;
        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '_' + yyyy;


        let __dirname = '/home/rubicamp/Desktop/Batch24/Rumahlaku/public/images/upload/'
        console.log(req.files)

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.send("Gagal upload")
        }
        var filename = []
        let sizeFiles = Object.keys(req.files.sampleFile).length;
        for (let i = 0; i < sizeFiles; i++) {
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let foto = req.files.sampleFile[i];
            filename.push(today + '_' + makeid(10) + i + '.jpg');
            // Use the mv() method to place the file somewhere on your server
            foto.mv(path.join(__dirname + filename[i]), function (err) {
                if (err) return err
            })
        }

        const filenameRen = filename.join(',');
        var sql = `INSERT INTO iklan (lokasi, coordinate,foto,harga,isjual,id_users,luas_tanah,kota,jml_kmr,isnego) VALUES ('${alamat}', '${koordinat}','${filenameRen}', ${harga}, ${kategori == 'jual' ? true : false}, ${Number(id_users)}, '${luas_tanah}','${kota}',${kamar},${isNego == 'on' ? true : false})`
        console.log(sql)
        pool.query(sql, (err, result) => {
            if (err) {
                console.log(err)
            } else {
                res.redirect('/')
            }
        })
    });




    router.get('/:page/kategori=sewa', function (req, res, next) {
        const per_page = 3;
        const page = req.params.page || 1;
        const queryObject = url.parse(req.url, true).search;
        let sql = `SELECT * FROM iklan WHERE isjual = false `
        pool.query(sql, (err, data) => {
            if (err) return err
            sql += `ORDER BY id ASC LIMIT 3 OFFSET ${(page - 1) * per_page} `
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                if (err) { res.status(400).json({ "error": err.message }); return; }
                // res.json(rowsFilt.rows);
                res.status(200).json({
                    data: rows.rows,
                    current: page,
                    filter: queryObject,
                    next_page: parseInt(page) + 1,
                    previous_page: parseInt(page) - 1,
                    pages: Math.ceil(data.rows.length / per_page)
                });
            });
        })
    })


    router.get('/:page/kategori=jual', function (req, res, next) {
        const per_page = 3;
        const page = req.params.page || 1;
        const queryObject = url.parse(req.url, true).search;
        let sql = `SELECT * FROM iklan WHERE isjual = true `
        pool.query(sql, (err, data) => {
            if (err) return err
            sql += `ORDER BY id ASC LIMIT 3 OFFSET ${(page - 1) * per_page} `
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                if (err) { res.status(400).json({ "error": err.message }); return; }
                // res.json(rowsFilt.rows);
                res.status(200).json({
                    data: rows.rows,
                    current: page,
                    filter: queryObject,
                    next_page: parseInt(page) + 1,
                    previous_page: parseInt(page) - 1,
                    pages: Math.ceil(data.rows.length / per_page)
                });
            });
        })
    })



    router.get('/Detail/:id', (req, res) => {
        var { id } = req.params;
        var sql = `SELECT i.*, u.username, u.no_telepon FROM iklan as i LEFT JOIN users as u ON i.id_users = u.id WHERE i.id = ${id}`;
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal memuat data iklan')
            } else {
                res.json({
                    data: result.rows,
                    coord: coord
                })

            }
        })
    })

    router.get('/coor', (req, res) => {
        var sql = "SELECT coordinate FROM iklan";
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal')
            } else {
                res.json({
                    data: result.rows
                })
            }
        })
    })

    // /* GET home page. */

    router.get('/:page', function (req, res, next) {
        const search = req.query.search
        // console.log(search)
        pool.query('SELECT lokasi FROM iklan', (err, result_lok) => {
            const result = result_lok.rows
            let lokasi = []
            let isLok = false
            result.forEach(item => {
                if (search && item.lokasi.toLowerCase().includes(search.toLowerCase())) {
                    lokasi.push(item.lokasi)
                    isLok = true
                }
            });
            let coord = []
            const per_page = 3;
            const page = req.params.page || 1;
            const queryObject = url.parse(req.url, true).search;
            let params = [];
            if (search && Number(search)) {
                params.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params.push(`harga = '${search}'`)
            }
            if (search && Number(search)) {
                params.push(`id = '${search}'`)
            }
            if (search && isLok) {
                if (lokasi.length > 0) {
                    let locs = ''
                    for (let i = 0; i < lokasi.length; i++) {
                        locs += ` lokasi = '${lokasi[i]}' ${i == lokasi.length - 1 ? "" : "OR"}`
                    }
                    params.push(`${locs}`)
                } else {
                    params.push(lokasi)
                }

            }
            if (search) {
                params.push(`foto = '${search}'`)
            }
            var sql = `SELECT * FROM iklan`;
            if (params.length > 0) {
                sql += ` WHERE `;
                for (let i = 0; i < params.length; i++) {
                    sql += `${params[i]}`;
                    if (params.length != i + 1) {
                        sql += ` OR `;
                    }
                }
            }
            // const sql = 'SELECT * FROM iklan ORDER BY id ASC';
            pool.query(sql, (err, rows) => {
                if (err) { res.status(400).json({ "error": err.message }); return; }
                let rowsRes = rows.rows
                rowsRes.forEach(item => {
                    coord.push(item.coordinate)
                });
                sql += ` ORDER BY id DESC LIMIT 3 OFFSET ${(page - 1) * per_page} `;
                pool.query(sql, (err, data) => {
                    if (err) { res.status(400).json({ "error": err.message }); return; }
                    // res.json(rowsFilt.rows);
                    res.status(200).json({
                        coord: coord,
                        data: data.rows,
                        current: page,
                        filter: queryObject,
                        next_page: parseInt(page) + 1,
                        previous_page: parseInt(page) - 1,
                        pages: Math.ceil(rows.rows.length / per_page)
                    });
                });
            })
        });
    })




    router.post('/register', function (req, res, next) {

        if (req.body.password != req.body.repassword) {
            req.flash('info', 'password doesnt match') //set



        }
        pool.query('select * from users where email= $1', [req.body.email], (err, data) => {
            if (err) {
                req.flash('info', 'try again later')

            }


            if (data.rows.lenght > 0) {
                console.log('rrr', data.rows.length > 0)
                req.flash('info', 'try again later')

            }

            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                if (err) {
                    req.flash('info', 'email alredy exist')



                }
                console.log(hash)
                pool.query(`insert into users(username,email, password,Telepon) values ('${req.body.username}', '${req.body.email}', '${hash}','${req.body.Telepon}')`, (err, data) => {

                    if (err) {
                        console.log(err)
                        req.flash('info', 'try again later')

                    }
                    req.flash('info', 'you have registered please sign in')
                    res.json({ msg: 'success' })
                })
            });
        })
    });


    router.post('/login', function (req, res, next) {
        const { email, password } = req.body
        pool.query(`select * from users where email = '${email}'`, (err, data) => {
            // console.log( data.rows[0].password)
            if (err) {
                console.log('www', err)
                req.flash('info', 'email alredy exist')
            }
            if (data.rows.length) {
                bcrypt.compare(password, data.rows[0].password, (err, result) => {
                    if (err) {
                        console.log('www', err)
                        req.flash('info', 'email/password incorrect')
                        return
                    }
                    req.session.user = data.rows[0]
                    if (result) res.json({ msg: 'success' })
                    else res.json({ msg: 'failed' })
                })
            }
        })
    });

    router.get('/compere/:id', (req, res) => {
        var { id } = req.params;
        let rep = id.split('+').join(',')
        var sql = `SELECT * FROM iklan WHERE id IN (${rep})`;
        pool.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal memuat data iklan')
            } else {
                res.json(result.rows)
            }
        })
    })





    return router;
}