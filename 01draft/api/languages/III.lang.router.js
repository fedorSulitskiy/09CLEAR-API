/// Connects the SQL query executor functions with html requests
const { createLang, updateLang, showAll, showLang, showCountriesByLanguage, createLangRequests, deleteLang } = require('./II.lang.controller');

const router = require('express').Router();
const { checkToken } = require('../../auth/auth');
// unregistered users can only see informationbut not change or add it

router.post("/", checkToken, createLang);
router.post("/requests/", checkToken, createLangRequests);
router.patch("/:id", checkToken, updateLang);
router.get("/", showAll);
router.get("/:id", showLang);
router.get("/:id(/^[A-Za-z]+$/)", showCountriesByLanguage);
router.delete("/:id", checkToken, deleteLang);

module.exports = router;