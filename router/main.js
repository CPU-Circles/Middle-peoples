const randomcode = require('uuid4')
const fs = require('fs')
const reload = require('self-reload-json')
var ip = require('request-ip')
const data = new reload('./database/data.json')
const mail = require('nodemailer')

module.exports = function (app) {
    //메인화면

    app.get('/', (req, res) => {
        res.render('./index.ejs', {
            title: "중앙인들",
            type: "메인",
            data: req.session.login ? `${req.session.login.number} ${req.session.login.name}` : "로그인 되지 않음"
        })
    });

    app.get('/login', (req, res) => {
        req.session.login = null
        res.render('./login.ejs', {
            title: "중앙인들",
            type: "로그인"
        })
    })

    app.get('/mail/:code', (req, res) => {
        if (data.accounts.find(u => u.uuid == req.params.code)) {
            data.accounts.find(u => u.uuid == req.params.code).verify = true
            data.save()
            res.render('./JTFSU.ejs', {
                title: "중앙인들",
                type: "메일인증"
            })
        } else {
            res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("잘못된 접근입니다.");\nlocation.href="/";</script></head>')
        }
    })

    app.post('/signup', (req, res) => {
        console.log(req.body)
        console.log(req.body.id)
        console.log(req.body.password)
        console.log(req.body.mail)
        console.log(req.body.number)
        console.log(req.body.name)
        if (!req.body.id || !req.body.password || !req.body.mail || !req.body.number || !req.body.name || req.body.password[0] != req.body.password[1]) return res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("잘못된 요청입니다.");\nlocation.href="/signin";</script></head>')
        if (data.accounts[0]) {
            if (data.accounts.find(u => u.id == req.body.id)) return res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("이미 존재하는 아이디 입니다.");\nlocation.href="/signin";</script></head>')
            if (data.accounts.find(u => u.mail == req.body.mail)) return res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("이미 존재하는 메일주소 유저입니다.");\nlocation.href="/signin";</script></head>')
            if (data.accounts.find(u => u.number == req.body.number)) return res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("이미 존재하는 학번 입니다.");\nlocation.href="/signin";</script></head>')
        }
        let random = randomcode()
        data.accounts.push({
            id: req.body.id,
            password: req.body.password[0],
            email: req.body.mail,
            number: req.body.number,
            name: req.body.name,
            uuid: random,
            verify: false
        })
        data.save()
        let transporter = mail.createTransport({
            service: 'gmail',
            auth: {
                user: 'jungangindeul@gmail.com',
                pass: 'cpuproject'
            }
        });

        let mailOptions = {
            from: 'jungangindeul@gmail.com',
            to: req.body.mail,
            subject: '중앙인들 메일인증',
            html: `<center><h1><a href="http://vendetta.tk:7777/">중앙인들</a></h1><br><br><h3>요청자 아이피</h3><br><h5>${(ip.getClientIp(req))}</h5><br><br><a href="http://vendetta.tk:7777/mail/${random}"><button>인증하기</button></a></center>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('error: ' + error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
            transporter.close()
        });
        res.send('<head><meta charset="utf-8" /><script type="text/javascript">alert("회원가입 요청에 성공하였습니다.");alert("회원가입에 사용된 메일에서 인증을 해주세요.");\nlocation.href="/login";</script></head>')
    })

    app.get('/signup', (req, res) => {
        res.render('./signup.ejs', {
            title: "중앙인들",
            type: "회원가입",
            login: req.session.login
        })
    })

    app.post('/signup', (req, res) => {
        console.log(req.body)
        res.redirect('/login')
    })

    app.post('/login', (req, res) => {
        console.log(req.body)
        if (data.accounts.find(i => i.id == req.body.id) && data.accounts.find(i => i.password == req.body.password)) {
            if (!data.accounts.find(i => i.id == req.body.id).verify) return res.send('<html><head><title>인증오류</title><meta charset="utf-8" /></head><body><script>alert("메일인증이 되지 않은 계정입니다.");window.location = "/login";</script></body></html>');
            req.session.login = data.accounts.find(i => i.id == req.body.id)
            res.redirect('/')
        } else {
            res.send('<html><head><title>인증오류</title><meta charset="utf-8" /></head><body><script>alert("틀리거나 없는 계정입니다.");window.location = "/login";</script></body></html>');
        }
    })

    app.get('/logout', (req, res) => {
        req.session.login = null
        res.redirect('/login')
    })

    // app.use((req, res, next) => {
    //     res.status(404);
    //     res.render('./error.ejs', {
    //         title: "Error",
    //         type: "에러 핸들링"
    //     })
    // })
}