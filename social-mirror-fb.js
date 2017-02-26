'use strict';

var fbsdk = require('fb');
var async = require("async");
var q = require("q");


function SocialMirrorFB(facebookOptions) {
  this.fb = new fbsdk.Facebook(facebookOptions);
}



SocialMirrorFB.prototype.resourceCollect = function(resource, fields, accessToken, mapFunction) {

  var deferred = q.defer();

  this.fb.api(resource, { fields: fields, access_token: accessToken },
    function(response) {
      if (response.error) { deferred.reject(response.error) }
      else { deferred.resolve(mapFunction(response)) }
    });

  return deferred.promise;
};


SocialMirrorFB.prototype.allResourcesCollect = function(resource, fields, accessToken, mapFunction) {

  var deferred = q.defer();
  var data = [];
  var after = '';
  var self = this;

  async.doWhilst(function (callback) {

    self.fb.api(resource, {
      fields: fields,
      limit: '200',
//      type: 'uploaded',
      after: after,
      access_token: accessToken
    }, function(response) {
//      console.log(response);
      if (/*!response || */response.error) {
        callback(response.error);
      } else {
        data = data.concat(response.data.map(mapFunction));
        if (response.paging && response.paging.next) {  // next is the best indicator to know if there are more
          after = response.paging.cursors.after;
        } else {
          after = undefined;
        }
        callback();
      }
    });

  },
  function () {
    return after !== undefined;
  },
  function (error) {
    if (error) { deferred.reject(error) }
    else { deferred.resolve(data) }
  });

  return deferred.promise;
};



SocialMirrorFB.prototype.photos = function(accessToken, profileId = 'me') {
  var photoMapFunction = function(photo) {
    return {
      id: photo.id,
      title: photo.name,
      thumb: photo.picture,
      album_id: photo.album.id, //if !uploaded -> (photo.album ? photo.album.id : '__no_album__'),
      source: (photo.images[0].source),
      height: (photo.images[0].height),
      width: (photo.images[0].width),
      creation: photo.created_time,
      link: photo.link,
      reactions: (photo.reactions ? photo.reactions.data.length : 0),
      comments: (photo.comments ? photo.comments.data.length : 0)
    }
  };
  return this.allResourcesCollect('/' + profileId + '/photos/uploaded', 'id,name,picture,album{id},images{source,width,height},created_time,link,reactions.limit(99){type},comments.limit(99){id}', accessToken, photoMapFunction);
};


SocialMirrorFB.prototype.albums = function(accessToken, profileId = 'me') {
  var albumMapFunction = function(album) {
    return {
      id: album.id,
      title: album.name,
      description: album.description,
      creation: album.created_time,
      count: album.count,
      thumb_photo_id: album.cover_photo.id,
      link: album.link,
      reactions: (album.reactions ? album.reactions.data.length : 0),
      comments: (album.comments ? album.comments.data.length : 0)
    }
  };
  return this.allResourcesCollect('/' + profileId + '/albums', 'id,name,description,created_time,count,cover_photo{id},link,reactions.limit(99){type},comments.limit(99){id}', accessToken, albumMapFunction);
};


SocialMirrorFB.prototype.pages = function(accessToken) {

  var profileMapFunction = function(profile) {
    return {
      id: profile.id,
      title: profile.name,
      thumb: profile.picture.data.url,
    }
  };
  return this.allResourcesCollect('/me/accounts', 'id,name,picture{url}', accessToken, profileMapFunction);
};


SocialMirrorFB.prototype.me = function(accessToken) {

  var profileMapFunction = function(profile) {
    return {
      id: profile.id,
      title: profile.name,
      thumb: profile.picture.data.url,
    }
  };
  return this.resourceCollect('/me', 'id,name,picture{url}', accessToken, profileMapFunction);
};


SocialMirrorFB.prototype.profiles = function(accessToken) {

  var deferred = q.defer();
  var self = this;

  async.parallel({
      user: function(callback) {
        self.me(accessToken).then(
          function(d) { callback(null, d) },
          function(e) { callback(e) }
        );
      },
      pages: function(callback) {
        self.pages(accessToken).then(
          function(d) { callback(null, d) },
          function(e) { callback(e) }
        );
      }
  }, function(error, data) {
    if (error) { deferred.reject(error) }
    else { deferred.resolve(data) }
  });

  return deferred.promise;
};



/*
SocialMirrorFB.prototype.getData = function(accessToken) {

  var deferred = q.defer();
  var self = this;

  async.parallel({
      photos: function(callback) {
        self.photos(accessToken).then(
          function(d) { callback(null, d) },
          function(e) { callback(e) }
        );
      },
      albums: function(callback) {
        self.albums(accessToken).then(
          function(d) { callback(null, d) },
          function(e) { callback(e) }
        );
      },
      accounts: function(callback) {
        self.pages(accessToken).then(
          function(d) { callback(null, d) },
          function(e) { callback(e) }
        );
      }
  }, function(error, data) {
    if (error) { deferred.reject(error) }
    else { deferred.resolve(data) }
  });

  return deferred.promise;

};
*/

module.exports = SocialMirrorFB;
