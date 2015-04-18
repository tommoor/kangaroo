var countdown = 30;
var countdownTimer;

var getRandomStream = function(callback){
  $.ajax({
    url: '/live',
    dataType: 'json',
    success: function(data){
      console.log(data);
      
      if (data.service == 'meerkat') {
        loadMeerkatData(data.stream_id, function(broadcast){
          updateInfo(broadcast.result);
          callback(broadcast.followupActions.playlist);
        });
      } else {
        loadPeriscopeData(data.stream_id, function(broadcast){
          updateInfo({
            broadcaster: {
              
            }
          });
          callback(broadcast.hls_url);
        });
      }
    }
  });
};

var loadMeerkatData = function(stream_id, callback) {
  $.ajax({
    url: 'https://resources.meerkatapp.co/broadcasts/'+ stream_id +'/summary',
    dataType: 'json',
    success: callback
  });
}

var loadPeriscopeData = function(stream_id, callback) {
  $.ajax({
    url: 'https://api.periscope.tv/api/v2/getAccessPublic?token=' + stream_id,
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
  $('#broadcaster-name').text(data.broadcaster.displayName);
  $('#stream-caption').text(data.caption);
  $('#stream-location').text(data.location);
}

var playRandomStream = function() {
  countdown = 30;

  getRandomStream(function(url){
    console.log("loading", url);
    loadPlayerWithUrl(url);
  });
}

var togglePause = function() {
  if (countdownTimer) { 
    clearTimeout(countdownTimer);
  } else {
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
  countdownTimer = setTimeout(incrementTimer, 1000);
}

setupControls();
incrementTimer();
playRandomStream();