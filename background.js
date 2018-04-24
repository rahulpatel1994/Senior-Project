const APPLICATION_KEY = "1b955de3207750463ac95bd5481207ac";
APPLICATION_ID = "f6a32887";

var myApp = angular.module('SummarizerExtension', ['ngRoute']);
myApp.controller("PopupListController", function ($scope) {

var URL;
var textapi;
var font_size_index = 1;
var font_sizes = ['small', 'medium', 'large', 'x-large', 'xx-large'];
var num = 3;

$( document ).ready(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {'command': 'getURL'}, function(response) {
      URL = response;
      var AYLIENTextAPI = require('aylien_textapi');
      textapi = new AYLIENTextAPI({
          application_id: APPLICATION_ID,
          application_key: APPLICATION_KEY
      });
      chrome.storage.local.get(['key'], function(result){
        if(result.key == parseInt(result.key, 10)){
          num = result.key;
          summarizeText(num);
        }
        else{
          num = 3;
          summarizeText(num);
        }
      });
      //summarizeText(num);
    });
  });
});

$(document).ready(function () {
  $(".nav li").removeClass("active");//this will remove the active class from
                                     //previously active menu item
  $('#home').addClass('active');
});

$('#insert').keypress(function(e){
  if(e.which == 13){
    $('#search').click();
  }
});

$('#search').click(function(){
  var num_sentences = $('#insert').val();
  chrome.storage.local.set({'key': num_sentences}, function(){});
  summarizeText(num_sentences);
  $('#insert').val('');
});

$('#schmalz_font').click(function(){
  if(font_size_index != 4){
    $('#summary_container').css('font-size', 'xx-large');
    font_size_index = 4;
  }
});

$('#int_font').click(function(){
  if(font_size_index != 4){
    $('#summary_container').css('font-size', font_sizes[font_size_index + 1]);
    font_size_index++;
  }
});

$('#dec_font').click(function(){
  if(font_size_index != 0){
    $('#summary_container').css('font-size', font_sizes[font_size_index - 1]);
    font_size_index--;
  }
});

function summarizeText(val){
  textapi.summarize({
    url: URL,
    sentences_number: val
    },function(error, response) {
      if (error === null) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {'text':response.sentences});
      });
        $scope.sentences = response.sentences;
        $('.loader').hide();
        $scope.$apply();
      }
    });
  }
});

/****************************************************************
HASHTAG STUFF DOWN BELOW!
****************************************************************/

var myApp = angular.module('HashtagSuggestion', ['ngRoute']);
myApp.controller("HashtagController", function ($scope) {

var textapi;
var URL;
var tag_size = ['','','','','','','','','',''];
var tag_size2 = ['','','','','','','','','',''];
var flag = false;

$( document ).ready(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {'command': 'getURL'}, function(response) {
      URL = response;
      var AYLIENTextAPI = require('aylien_textapi');
      textapi = new AYLIENTextAPI({
        application_id: APPLICATION_ID,
        application_key: APPLICATION_KEY
      });
      //Add function calls below
      Hashtag(textapi);
    });
  });
});

$(document).ready(function () {
  $(".nav li").removeClass("active");//this will remove the active class from
                                     //previously active menu item
  $('#tag').addClass('active');
});

$('#add_tag').click(function(){
  flag = true;
  $('#add_tag').prop('disabled',true);
  Hashtag(textapi);
});

function Hashtag(textapi){
  textapi.hashtags({
    url: URL
    },function(error, response) {
      if (error === null) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {'text':response.hashtags});
      });
        for(var i = 0; i < tag_size.length; i++){
          tag_size[i] = response.hashtags[i];
        }
        $scope.hashtags = tag_size;
        if(flag == true){
          for(var i = 0; i < tag_size2.length; i++){
            tag_size2[i] = response.hashtags[i+10];
          }
          $scope.hashtags2 = tag_size2;
        }
        $('.loader').hide();
        $scope.$apply();
      }
    });
  }
});

/****************************************************************
CITAION STUFF DOWN BELOW!
****************************************************************/

var myApp = angular.module('CitationCreation', ['ngRoute']);
myApp.controller('CitationController', function ($scope) {

var textapi;
var URL;
var webtitle;
var author_name;

$( document ).ready(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {'command': 'getURL'}, function(response) {
      URL = response;
      var AYLIENTextAPI = require('aylien_textapi');
      textapi = new AYLIENTextAPI({
        application_id: APPLICATION_ID,
        application_key: APPLICATION_KEY
      });
      //Add function calls below
      citation(textapi);
    });
  });
});

$(document).ready(function () {
  $(".nav li").removeClass("active");//this will remove the active class from
                                     //previously active menu item
  $('#cite').addClass('active');
});

function citation(textapi){
  textapi.extract({
    url: URL
    },function(error, response) {
      var first_name;
      var last_name;
      var date;
      var cites;
      if (error === null) {
        if(response.author == ''){
          author_name = "Cannot extract author name.";
        }
        else{
          author_name = response.author;
          last_name = author_name.substr(author_name.indexOf(' ')+1);
          first_name = author_name.substr(0,author_name.indexOf(' '));
        }
        if(response.publishDate == ''){
          date = "Cannot extract publication date.";
          cites = "Unable to cite this article/page."
        }
        else{
          date = parseDate(response.publishDate);
          if(URL[11] == '.'){
            webtitle = URL.substr(URL.indexOf("ww.")+3, URL.indexOf(".c")-2);;
          }
          else{
            webtitle = URL.substr(URL.indexOf("//")+2, URL.indexOf(".c")-8);
          }
          cites = last_name + "," + first_name + ".\"" + response.title + "\"" + webtitle + ","
          + parseDate(response.publishDate) + "," + URL.substr(URL.indexOf("//")+2) + ".";
        }
        $scope.author = author_name;
        $scope.pub_date = date;
        $scope.cite = cites;
        $scope.show = true;
        $scope.$apply();
      }
    });
  }

  function parseDate(date){
    return date.slice(0,10);
  }

});

/****************************************************************
HOWTO PAGE STUFF DOWN BELOW!
****************************************************************/

var myApp = angular.module('HowToPage', ['ngRoute']);
myApp.controller('HowToController', function($scope){

  $(document).ready(function () {
    $(".nav li").removeClass("active");//this will remove the active class from
                                       //previously active menu item
    $('#how').addClass('active');
  });
});

/****************************************************************
KEYWORDS STUFF DOWN BELOW!
****************************************************************/
var myApp = angular.module('KeywordsGen', ['ngRoute']);
myApp.controller('KeywordsController', function ($scope) {

  var textapi;
  var URL;
  var article;

  $( document ).ready(function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {'command': 'getURL'}, function(response) {
        URL = response;
        var AYLIENTextAPI = require('aylien_textapi');
        textapi = new AYLIENTextAPI({
          application_id: APPLICATION_ID,
          application_key: APPLICATION_KEY
        });
        //Add function calls below
        $('.table').hide();
        getText(textapi);
      });
    });
  });

  $(document).ready(function () {
    $(".nav li").removeClass("active");//this will remove the active class from
                                       //previously active menu item
    $('#keywords').addClass('active');
  });

  function getText(textapi){
    textapi.extract({
      url: URL
      },function(error, response) {
        if (error === null) {
          getkeywords(response.article);
        }
      });
    }

  function getkeywords(text){
    textapi.entities({
      text:text
      },function(error, response) {
        if (error === null) {
          $scope.keywords = response.entities.keyword;
          $scope.locations = response.entities.location;
          $scope.organizations = response.entities.organization;
          $scope.persons = response.entities.person;
          $scope.wikiLink = 'https://www.wikipedia.org/wiki/';
          $('.loader').hide();
          $('.table').show();
          $scope.$apply();
        }
      });
    }
});
