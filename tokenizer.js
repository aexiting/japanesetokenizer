var express = require('express');

var kuromoji = require("kuromoji");

var bodyParser = require('body-parser');



var router = express.Router();



/**there should be a performance increase if we move the build process of the tokenizer outside the tokenize function so it is only done once at the start, this also eliminates some complication**/

var tokenizer;

kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build(function (err, t) {

    tokenizer = t;

});



function tokenize(jpString){



    var path = tokenizer.tokenize(jpString);

    var rulehelper = {

        動詞: ['助動詞', '動詞', '助詞','接続助詞'],

        助動詞: ['助動詞']

    };

    

    //goes through each token in sentence

    function mergeNeeded(token1, token2){

        if(token1.pos != "動詞" && token1.pos != '助動詞'){

            return false;

        }

        else{

            return rulehelper[token1.pos].includes(token2.pos);

        }

    }



    function mergeTokens(tokensArray,mergeArray){

        var mergedArray = [];

        for (var i = 0; i < tokensArray.length; i++){

            var oldindex = i;

            while(mergeArray[i] == true){

                console.log(i);

                tokensArray[i+1] = tokensArray[i] + tokensArray[i+1];

                i++;

            }

            mergedArray.push(tokensArray[i]);

            console.log(i);

        }

        return mergedArray;



    }

    var tokensArray = []; //contains all token's surface forms

    var mergeArray = []; //boolean array for use of merging.

    for (var i = 0; i < path.length; i++) {

        tokensArray[i] = path[i].surface_form;

        if(i < path.length -1){

            if(mergeNeeded(path[i],path[i+1])){

                mergeArray[i] = true;

            }

            else{

                mergeArray[i] = false;

            }

        }

    }

    

    var finalArray = mergeTokens(tokensArray,mergeArray);

    console.log(mergeArray);

    console.log(finalArray);

    console.log(tokensArray);

    return finalArray;

}



router.post('/',function(req, res){

    var tokenizedString = tokenize(req.data);

     if (err) return res.status(500).send("There was a problem tokenizing.");

    /**tokenizedString is an array of tokens at this point so we can join them into a string with a space between each token**/

    res.end(tokenizedString.join(" "));

});



module.exports = router;