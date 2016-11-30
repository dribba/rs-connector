// var req = require.context('./', true, /Spec\.js$/);
// console.log(JSON.stringify(req));
// req.keys().forEach(req);
var context = require.context('./', true, /\S+\.js$/);
context.keys().forEach(context);