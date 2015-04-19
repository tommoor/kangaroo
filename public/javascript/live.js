var countdown = 30;
var countdownTimeout;

var getRandomStream = function(callback){
  $.ajax({
    url: '/live',
    dataType: 'json',
    success: function(data){
      loadBroadcastData(data.stream_id, callback);
    }
  });
};

var loadBroadcastData = function(stream_id, callback) {
  $.ajax({
    url: 'https://resources.meerkatapp.co/broadcasts/'+ stream_id +'/summary',
    dataType: 'json',
    success: callback
  });
}

var loadPlayerWithUrl = function(url) {
  var obj = getFlashMovieObject("player");
  if (obj != null) {
    obj.playerLoad(url);
    obj.playerPlay();
  }
}

var getFlashMovieObject = function(movieName) {
  if (window.document[movieName]) {
      return window.document[movieName];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1) {
    if (document.embeds && document.embeds[movieName])
      return document.embeds[movieName];
  } else {
    return document.getElementById(movieName);
  }
}

var updateInfo = function(data) {
  if (data.broadcaster) {
    $('#broadcaster-name').text(data.broadcaster.displayName);
  }
  $('#stream-watchers').text(data.watchersCount);
  $('#stream-caption').text(data.caption);
  $('#stream-location').text(data.location);
}

var playRandomStream = function() {
  countdown = 30;

  getRandomStream(function(broadcast){
    console.log(broadcast);
    if (broadcast.result.status == 'live') {
      updateInfo(broadcast.result);
      loadPlayerWithUrl(broadcast.followupActions.playlist);
    } else {
      playRandomStream();
    }
  });
}

var togglePause = function() {
  if (countdownTimeout) { 
    clearTimeout(countdownTimeout);
    countdownTimeout = null;
    $('#pause').text('Resume');
  } else {
    $('#pause').text('Pause');
    incrementTimer();
  }
}

var setupControls = function() {
  $('#pause').on('click', togglePause);
  $('#skip').on('click', playRandomStream);
}

var incrementTimer = function() {
  if (countdown <= 0) {
    playRandomStream();
  } else {
    countdown--;
  }
  
  $('#timer').text(countdown);
  countdownTimeout = setTimeout(incrementTimer, 1000);
}

setupControls();
incrementTimer();
playRandomStream();