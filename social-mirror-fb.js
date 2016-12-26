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
      thumb: photo.picture,
      source: (photo.images[0].source),
      height: (photo.images[0].height),
      width: (photo.images[0].width),
      link: photo.link,
      creation: photo.created_time,
      comments: (photo.comments ? photo.comments.data.length : 0),
      reactions: (photo.reactions ? photo.reactions.data.length : 0)
    }
  };

  return this.getAll('/me/photos', 'picture,images{source,width,height},created_time,link,reactions.limit(99){type},comments.limit(99){id}', accessToken, photoMapFunction);
};


module.exports = SocialMirrorFB;