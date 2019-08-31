const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'marianapatc@hotmail.com',
        subject: 'Thank you for joining in!',
        text: `Welcome to the app ${name}! Let me know how you get along you the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'marianapatc@hotmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}! Can we do something to make you stay? Please let us know.`
    })
}

/* sgMail.send({
    to: 'andre.rua.pires@gmail.com',
    from: 'marianapatc@hotmail.com',
    subject: '"a enviar email programaticamente :D"',
    text: 'I hope this actually get to you.',
    html: '<h1><strong>Olá xuxuzinho</strong><h1> <br/>'+        
            '<img src="https://i.pinimg.com/originals/78/d0/6d/78d06d7086355f6d2b23f1e3bf53e59e.jpg"/>'
}) */

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}