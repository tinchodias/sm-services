'use strict';



function SocialMirrorFB(fb, async, q) {
  this.fb = fb;
  this.async = async;
  this.q = q;
}



SocialMirrorFB.prototype.getAll = function(resource, fields, accessToken, photoMapFunction) {

  var deferred = this.q.defer();
  var data = [];
  var after = '';
  var self = this;

  self.async.doWhilst(function (callback) {

    self.fb.api(resource, {
      fields: fields,
      limit: '200',
      type: 'uploaded',
      after: after,
      access_token: accessToken
    }, function(response) {
//      console.log(response);
      if (!response || response.error) {
        callback(response.error);
      } else {
        data = data.concat(response.data.map(photoMapFunction));
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



SocialMirrorFB.prototype.getAllPhotos = function(accessToken) {
  var photoMapFunction = function(photo) {
    return {
      id: photo.id,
      title: photo.name,
      thumb: photo.picture,
      album_id: photo.album.id,
      source: (photo.images[0].source),
      height: (photo.images[0].height),
      width: (photo.images[0].width),
      creation: photo.created_time,
      link: photo.link,
      reactions: (photo.reactions ? photo.reactions.data.length : 0),
      comments: (photo.comments ? photo.comments.data.length : 0)
    }
  };

  return this.getAll('/me/photos', 'id,name,picture,album{id},images{source,width,height},created_time,link,reactions.limit(99){type},comments.limit(99){id}', accessToken, photoMapFunction);
};


SocialMirrorFB.prototype.getAllAlbums = function(accessToken) {
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
  return this.getAll('/me/albums', 'id,name,description,created_time,count,cover_photo{id},link,reactions.limit(99){type},comments.limit(99){id}', accessToken, photoMapFunction);
};


SocialMirrorFB.prototype.getAllAccounts = function(accessToken) {

  var deferred = this.q.defer();

  this.fb.api("/me/accounts", { fields: [], access_token: accessToken },
    function(response) {
      if (response.error) { deferred.reject(response.error) }
      else { deferred.resolve(response.data) }
    });

  return deferred.promise;
};




SocialMirrorFB.prototype.getData = function(accessToken) {

  var deferred = this.q.defer();
  var self = this;

  this.async.parallel({
      photos: function(callback) {
        self.getAllPhotos(accessToken).then(callback);
      },
      albums: function(callback) {
        self.getAllAlbums(accessToken).then(callback);
      },
      accounts: function(callback) {
        self.getAllAccounts(accessToken).then(callback);
      }
  }, function(error, results) {
    if (error) { deferred.reject(error) }
    else { deferred.resolve(data) }
  });

  return deferred.promise;

};


module.exports = SocialMirrorFB;
