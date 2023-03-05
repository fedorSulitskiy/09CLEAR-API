/// Executes the SQL queries and catches any immediate connection errors
const winston = require('winston');

const { create, update, showAll, showByID, showCountriesByLanguage, deleteByID } = require('./I.lang.service');

const status500 = function(res, err) {
    winston.error(err);
    return res.status(500).send('Database connection error');
}

module.exports = {
    createLang: (req, res) => {
        const body = req.body;
        create(body, (err, results) => {
            if (err) {
                if (err.code==='ER_DUP_ENTRY') {
                    winston.error(err)
                    return res.status(400).send(`Language with isoCode ${req.body.isoCode} already exists`);
                }
                status500(res, err);
            }
            winston.info('New language created')
            return res.status(200).send(results);
        });
    },
    updateLang: (req, res) => {
        const body = req.body;
        update(req.params.id, body, (err, results) => {
            if (err) {
                status500(res, err);
            }
            if (results) {
                const noAffectedRows = results.affectedRows;
                const noChangedRows = results.changedRows;
                if (noAffectedRows === 0) {
                    winston.error(err);
                    return res.status(404).send("Could not find language");
                }
                if (noChangedRows === 0) {
                    winston.info('No content has been changed. ISO code: '+req.params.id);
                    return res.status(200).send('No changes implemented');
                }
            }
            winston.info('Language updated. ISO code: '+req.params.id);
            return res.status(200).send(results);
        });
    },
    showAll: (req, res) => {
        showAll((err, results) => {
            if (err) {
                status500(res, err);
            }
            winston.info(results.length+' langauges found');
            return res.status(200).send(results);
        })
    },
    showLang: (req, res) => {
        showByID(req.params.id, (err, results) => {
            if (err) {
                status500(res, err);
            }
            if (results.length === 0) {
                winston.error('Could not find language. ISO code: '+req.params.id);
                return res.status(404).send("Could not find language");
            }
            winston.info('Language found. ISO code: '+req.params.id);
            return res.status(200).send(results);
        })
    },
    showCountriesByLanguage: (req, res) => {
        showCountriesByLanguage(req.params.id, (err, results) => {
            if (err) {
                status500(res, err);
            }
            if (results.length === 0) {
                winston.error('Could not find language. ISO code: '+req.params.id);
                return res.status(404).send("Could not find language");
            }
            winston.info('Language found. ISO code: '+req.params.id);
            return res.status(200).send(results);
        });
    },
    deleteLang: (req, res) => {
        deleteByID(req.params.id, (err, results) => {
            const noAffectedRows = results.affectedRows;
            if (err) {
                status500(res, err);
            }
            if (noAffectedRows === 0) {
                winston.error('Could not find language. ISO code: '+req.params.id);
                return res.status(404).send("Could not find language");
            }
            winston.info('Language deleted. ISO code: '+req.params.id);
            return res.status(200).send(results);
        });
    }
};