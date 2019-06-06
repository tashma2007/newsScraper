var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");

var PORT = 8080;

// Initialize Express
var app = express();

