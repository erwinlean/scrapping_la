"use strict";

// This next lines is just for text error at eventemitter, checking if thats works properly...
require('events').EventEmitter.prototype._maxListeners = 100;

document.getElementById("form_id").addEventListener("submit", function(event){
    event.preventDefault();
});