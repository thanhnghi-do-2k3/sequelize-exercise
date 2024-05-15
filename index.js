const express = require('express');
const app = express();
const port = 5000 || process.env.PORT;

// Handlebars
const expressHbs = require('express-handlebars');
const { createPagination } = require('express-handlebars-paginate');

// Static folder is /html
app.use(express.static(__dirname + '/html'));

app.engine(
    'hbs',
    expressHbs.engine(
        {
            extname: 'hbs',
            defaultLayout: "layout",
            layoutsDir: __dirname + '/views/layouts/',
            partialsDir: __dirname + '/views/partials/',
            runtimeOptions: {   //to use default value for properties
                allowProtoPropertiesByDefault: true
            },
            helpers: { //to use pagination
                createPagination: createPagination
            }

        }
    )
)
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.use('/blogs', require('./routes/route'));

app.listen(port, () => {
    console.log('Example app listening on port port!');
});
