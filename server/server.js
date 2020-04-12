import path from 'path';
import fs from 'fs';
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Weather from '../src/Weather';

const PORT = 8080;
const app = express();
const router = express.Router();

const renderContent = (req, res, next) => {
    fs.readFile(path.resolve('./build/index.html'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('got error')
        }
        return res.send(
            data.replace(
                '<div id="root"></div>',
                `<div id="root">${ReactDOMServer.renderToString(<Weather />)}</div>`
            )
        )
    })
};
router.use('^/$', renderContent);
router.use(
    express.static(path.resolve(__dirname, '..', 'build'), { maxAge: '20d' })
);

app.use(router);

app.listen(PORT, () => {
    console.log(`SSR running on port ${PORT}`)
});