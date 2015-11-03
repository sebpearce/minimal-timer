'use strict';

/*

  Author: Seb Pearce (http://sebpearce.com)
  Description: A minimalist timer which responds to user input in a fuzzy-logic kind of way.
  Date: 2013.07.28

*/

(function timer(){

  var timerInterval;
  var isFinished = false;
  var isRunning = false;
  var isPaused = false;
  var beepSound;
  var secondsLeft = 0;

  var longhandNumbers = {
    'a thousand': '1000',
    'one thousand': '1000',
    'thousand': '1000',
    'one hundred': '100',
    'a hundred': '100',
    'hundred': '100',
    'ninety': '90',
    'eighty': '80',
    'seventy': '70',
    'sixty': '60',
    'fifty': '50',
    'forty': '40',
    'thirty': '30',
    'twenty': '20',
    'nineteen': '19',
    'eighteen': '18',
    'seventeen': '17',
    'sixteen': '16',
    'fifteen': '15',
    'fourteen': '14',
    'thirteen': '13',
    'twelve': '12',
    'eleven': '11',
    'ten': '10',
    'nine': '9',
    'eight': '8',
    'seven': '7',
    'six': '6',
    'five': '5',
    'four': '4',
    'three': '3',
    'two': '2',
    'one': '1',
    'and': '',
    '-': ' ',
  };

  function convertToDigits(string) {
    // iterate through longhandNumbers and replace the key in string with the value
    for (var key in longhandNumbers) {
      var re = new RegExp(key,"gi"); //gi = global + case insensitive
      string = string.replace(re, longhandNumbers[key]);
    }
    return string;
  }

  function getTimeURLQuery()
  {
    var query = window.location.search.substring(1);
      if (query) {
        query = query.replace(/%20/g, ' ');
        return query;
      }
    return false;
  }

  function startTimer(totalSeconds) {

    // ignore input if user typed "0 seconds" etc.
    if (totalSeconds == 0) {
      return 0;
    }

    // create beepSound audio element if it doesn't exist yet
    if (!beepSound) {
      // buffers automatically when created
      beepSound = new Audio("vibes.wav"); 
    }

    $('#appname').hide();
    $('#timeinput').hide();
    $('#message').fadeTo('fast', 0);
    $('#timer').show();
    
    // clear any previous timers
    clearInterval(timerInterval);
    
    // set start to current time as Unix timestamp
    var start = (new Date).getTime(); 
    var end = start + totalSeconds * 1000; 

    // show the time immediately before we start counting down  
    var totalTime = calcTime(totalSeconds);
    $('#timer').text(totalTime);
    $(document).attr('title', totalTime);

    isRunning = true;
    
    //every second, do this:
    timerInterval = setInterval(function() {
    
      // update "now"
      var now = $.now();
      // update how much time is remaining
      var millisecondsLeft = end - now;

      //when timer is finished
      if (millisecondsLeft <= 0) {
        beepSound.play();
        clearInterval(timerInterval); 
        $('#timer').text('Done.');
        $('#message').text('Press enter to start again.');
        $('#message').fadeTo('fast', 1);
        $(document).attr('title', 'Done.');
        isFinished = true;
        isRunning = false;
        alert('Done.');
        return 0; 
      }
      // convert to seconds 
      secondsLeft = Math.round(millisecondsLeft / 1000);
      // update span text with new time
      var result = calcTime(secondsLeft);
      $(document).attr('title', result);
      $('#timer').text(result);

    }, 1000);

  }


  function pauseTimer() {

    clearInterval(timerInterval);
    isPaused = true;
    $('#message').text('Timer paused.');
    $('#message').fadeTo('fast', 1);

  }

  function unpauseTimer() {

    startTimer(secondsLeft);
    isPaused = false;
    $('#message').fadeTo('fast', 0);

  }


  // give it an amount of seconds and it will format it as total time remaining and return a string
  function calcTime(seconds) {

    //find out how many hours/mins/seconds are left
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * (3600);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * (60);

    // don't show hours/minutes if we don't need them
    if (hours > 0)
      var timeStr = (leadingZero(hours) + ":" + leadingZero(minutes) + ":" + leadingZero(seconds));
    else if (minutes > 0)
      var timeStr = (leadingZero(minutes) + ":" + leadingZero(seconds));
    else
      var timeStr = leadingZero(seconds);

    return timeStr;
  }

  function leadingZero(time) {

    return (time < 10) ? "0" + time : + time;

  }

  function convertUserInput(string) {

    // convert any longform numbers to digits
    string = convertToDigits(string); 

    // check for two digits separated by a space and handle them
    if (string.match(/\d\s\d/)) {
      var dub = /(\d+)\s(\d+)/g.exec(string);
      // dub[0] should be the whole of the matched regex, and [1] & [2] are the \d values
      if (dub.length == 3) {
        if (dub[2] == 1000) { // if it's 1000, multiply [1] by [2] e.g. 2 1000 -> 2000
          string = string.replace(dub[0], (parseInt(dub[1],10) * parseInt(dub[2],10)));
        } else if (dub[2] == 100) { // if it's 100, multiply [1] by [2] e.g. 2 100 -> 200
          string = string.replace(dub[0], (parseInt(dub[1],10) * parseInt(dub[2],10)));
        } else { // else add the values e.g. forty five -> 40 5 -> 45
          string = string.replace(dub[0], (parseInt(dub[1],10) + parseInt(dub[2],10)));
        }
      }
    }

    var ok = false;
    var hours = 0;
    var min = 0;
    var sec = 0;

    if (string.match(/h(ou?)rs?/)) {
      var h = /(\d+)\s?h(ou?)rs?/.exec(string); 
      hours = parseInt((h[1]),10) * 3600; // number of hours
      ok = true;
    } else if (string.match(/(\d\s|\d)h/)) {
      var h = /(\d+)\s?h/.exec(string); 
      hours = parseInt((h[1]),10) * 3600; // number of hours
      ok = true;
    } else hours = 0; 

    if (string.match(/min(ute?)s?/)) {
      var m = /(\d+)\s?min(ute?)s?/.exec(string); 
      min = parseInt((m[1]),10) * 60; // number of minutes
      ok = true;
    } else if (string.match(/(\d\s|\d)m/)) {
      var m = /(\d+)\s?m/.exec(string); 
      min = parseInt((m[1]),10) * 60; // number of minutes
      ok = true;
    } else min = 0;

    if (string.match(/sec(ond?)s?/)) {
      var s = /(\d+)\s?sec(ond?)s?/.exec(string); 
      sec = parseInt((s[1]),10); // number of seconds
      ok = true;
    } else if (string.match(/(\d\s|\d)s/)) {
      var s = /(\d+)\s?s/.exec(string); 
      sec = parseInt((s[1]),10); // number of seconds
      ok = true;
    } else sec = 0;

    if (string.match(/^(\d+):(\d+):(\d+)$/)) {
      var d = /(\d+):(\d+):(\d+)/.exec(string);
      hours = parseInt((d[1]),10) * 3600;
      min = parseInt((d[2]),10) * 60;
      sec = parseInt((d[3]),10);
      ok = true;
    } else if (string.match(/^(\d+):(\d+)$/)) {
      var d = /(\d+):(\d+)/.exec(string);
      min = parseInt((d[1]),10) * 60;
      sec = parseInt((d[2]),10);
      ok = true;
    }

    if (string.match(/^[0-9]+$/)) {
      hours = 0;
      min = parseInt(string) * 60;
      sec = 0;
      ok = true;
    }

    var result = hours + min + sec;
    if (!ok || isNaN(result) || result <= 0)
      return 0;
    else {
      if (result > 86400) {
        $('#message').text('The maximum time you can set is 24 hours.');
        $('#message').fadeTo('fast', 1);
        return 0;
      }
      return result;
    }
  }




  //react to user keypresses
  $(document).keydown(function(event){

    if(event.keyCode == 13) {
      //convert the input into an amount of seconds and send it to the startTimer function
      if (isRunning && !isPaused) {
        pauseTimer();
      } else if (isRunning && isPaused) {
        unpauseTimer();
      } else if (!isRunning && !isFinished) {
        startTimer( convertUserInput($('#timeinput').val()) );
      } else if (!isRunning && isFinished) {
        $('#timer').hide();
        $('#message').fadeTo('fast', 0);
        $(document).attr('title', 'Timer');
        $('#appname').show();
        $('#timeinput').show();
        $('#timeinput').focus();
        isFinished = false;
      }
    } else if (event.keyCode == 32) {
      if (isRunning && !isPaused) {
        pauseTimer();
      } else if (isRunning && isPaused) {
        unpauseTimer();
      } 
    } else if (event.keyCode == 27) {
        clearInterval(timerInterval);
        $('#timer').hide();
        $('#message').fadeTo('fast', 0);
        $(document).attr('title', 'Timer');
        $('#appname').show();
        $('#timeinput').show();
        $('#timeinput').focus();
        isFinished = false;
        isRunning = false;
        isPaused = false;
    }
    
  });

  $(document).ready(function(){

    var query = getTimeURLQuery();

    if (query) {
      startTimer( convertUserInput(query) );
    }

  });

})();
