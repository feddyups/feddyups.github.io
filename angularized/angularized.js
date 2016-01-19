angular.module('ssv', ['ngRoute', 'duScroll', 'ng', 'ngResource', 'ngSanitize']);

angular.module('ssv')
.config(['$interpolateProvider', function ($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);


//============================SERVICES
angular.module('ssv').factory("services", ['$http', function($http) {
  /*to do: Use a Provider service so we can be able to configure these*/
  var consumerKey = 'KIjT8ztLstEtvm6TMCOCPXh4eVhZxjYsCNc97llFX6WNnkkjOw';
  var apiUrl = "https://api.tumblr.com/v2/blog/";
  var obj = {};
  obj.getAllPostsNoTag = function(offset, limit) {
    ////console.log('fetchin ::  Offset:'+offset+' limit: 4');
    return $http({
      method: 'jsonp',
      url: apiUrl + Theme.hostname + '/posts?api_key=' + consumerKey + '&limit=' + parseInt(limit) + '&offset=' + parseInt(offset) + '&callback=JSON_CALLBACK'
    });
  };
  obj.getAllPosts = function(offset, limit, tag) {
    //console.log('tag is '+tag);
    return $http({
      method: 'jsonp',
      url: apiUrl + Theme.hostname + '/posts?api_key=' + consumerKey + '&tag=' + tag + '&limit=' + parseInt(limit) + '&offset=' + parseInt(offset) + '&callback=JSON_CALLBACK'

    });
  };
  obj.getPostType = function(postType, limit) {
    return $http({
      method: 'jsonp',
      url: apiUrl + Theme.hostname + '/posts/' + postType + '?api_key=' + consumerKey + '&limit=' + parseInt(limit) + '&callback=JSON_CALLBACK'
    });
  };
  obj.getPostTypeTagged = function(postType, offset, limit, tag) {
    ////console.log('tag is '+tag);
    return $http({
      method: 'jsonp',
      url: apiUrl + Theme.hostname + '/posts/' + postType + '?api_key=' + consumerKey + '&tag=' + tag + '&limit=' + parseInt(limit) + '&offset=' + parseInt(offset) + '&callback=JSON_CALLBACK'
    });
  };
  obj.getSinglePost = function(postID,notesInfo,reblogInfo) {
    return $http({
      method: 'jsonp',
      url: apiUrl + Theme.hostname + '/posts/?id=' + postID + '&notes_info='+notesInfo+'&reblog_info='+reblogInfo+'&api_key=' + consumerKey + '&callback=JSON_CALLBACK'
    });
  };
  return obj;
}]);
angular.module('ssv').factory('concatService', function($rootScope) {
  var concatdata = {};
  concatdata.list = '';
  concatdata.reset = '';
  concatdata.prepBroadcast = function(data, reset) {
    this.list = data;
    if (reset){
      this.reset = true;
      //console.log('data reset is TRUE;');
    }
    else{
      this.reset = false;
      //console.log('data reset IS FALSE');
    }
    this.broadcastItem();
  };
  concatdata.broadcastItem = function() {
    $rootScope.$broadcast('handleBroadcast');
    //console.log('broadcasting handleBroadcast');
  };
  return concatdata;
});
angular.module('ssv').factory('interactions', function($rootScope) {
  var interactions = {};
  interactions.activePostID = '';
  interactions.activetag = '';
  interactions.activePostOrder = '';
  interactions.offsetcounter = 0;
  interactions.prepareBroadcastOffsetCounter = function(setCountNumber){
     this.offsetcounter = setCountNumber;
     this.broadcastCounter();
  };
  interactions.prepareBroadcast = function(data, orderdata) {
    if (orderdata !== undefined) {
      this.activePostOrder = orderdata;
    }
    this.activePostID = data;
    this.broadcastItem();
  };
  interactions.prepareBroadcastTag = function(activetagVar) {
    if (activetagVar !== undefined) {
      this.activetag = activetagVar;
      console.log('activetag'+activetagVar);
    }
    else{
      this.activetag = '';
      console.log('NO activetag'+activetagVar);
    }
    
    this.broadcastItem();
  };
  interactions.broadcastItem = function() {
    $rootScope.$broadcast('broadcastIdTagAndOrder');
  };
  interactions.broadcastCounter = function(){
    $rootScope.$broadcast('broadcastOffsetCounter');
  };
  return interactions;
});
angular.module('ssv').factory('datastore', function($rootScope) {
  var datastore = {};
  datastore.featuredPosts = '';
  datastore.masonPosts = '';
  datastore.newestPosts = '';
  datastore.storeFeaturedData = function(data) {
    this.featuredPosts = data;
    this.broadcastFeatured();
  };
  datastore.storeMasonsData = function(data) {
    this.masonPosts = data;
    this.broadcastMasons();
  };
  datastore.storeNewestData = function(data) {
    this.newestPosts = data;
    this.broadcastNewest();
  };
  datastore.broadcastFeatured = function() {
    $rootScope.$broadcast('DataStoreFeatured');
  };
  datastore.broadcastMasons = function() {
    $rootScope.$broadcast('DataStoreMasons');
  };
  datastore.broadcastNewest = function() {
    $rootScope.$broadcast('DataStoreNewest');
  };
  return datastore;
});
// =============================FILTERS

angular.module('ssv').filter('htmlToPlaintext', function() {
  return function(text, limit, tail) {
    var changedString = String(text).replace(/<[^>]+>/gm, '');
    var length = changedString.length;
    return changedString.length > limit ? changedString.substr(0, limit - 1) + (tail || ' …') : changedString;
    //return changedString; 
  };
});

angular.module('ssv')
.filter('TruncateWords', [
  function(){
    return function(input, words, tail){
      if (isNaN(words)) return input;
      if (words <= 0) return '';
      if (input) {
        var inputWords = input.split(/\s+/);
        if (inputWords.length > words) {
          input = inputWords.slice(0, words).join(' ') + (tail || '');
          //input = inputWords.slice(0, words).join(' ');
        }
      }
      return input;
    };
  }
]);

angular.module('ssv')
.filter('Titleize', [
  function(){
    return function(input, words){
      if (isNaN(words)) return input;
      if (words <= 0) return '';
      if (input) {
        var inputWords = input.split(/\s+/);
        if (inputWords.length > words) {
          var fixTitle = inputWords.map(function(x){return x.replace(/(^\è$|^da$|^a$|^the$|^\:$|^di$|^ci$|\-|^con$|^\,$)/g, '');});
          input = fixTitle.slice(0, words).join(' ');
        }
      }
    return input;
    };
  }
]);


angular.module('ssv').filter("trustUrl", ['$sce', function($sce) {
  return function(recordingUrl) {
    return $sce.trustAsResourceUrl(recordingUrl);
  };
}]);
angular.module('ssv').filter("trustHtml", ['$sce', function($sce) {
  return function(stringtohtml) {
    return $sce.trustAsHtml(stringtohtml);
  };
}]);

angular.module('ssv').filter('expressiveTime', [function() {
  return function(T) {
    var f = Math.round,
      NT = nowseconds - T,
      h = NT / 3600,
      d = h / 24,
      mo = d / 30,
      weeks = d / 7,
      y = d / 365,
      m = h * 60,
      s = m * 60;
    var r = 'really old post';
    //var sun =f(y)+' years '+f(mo)+' months '+f(d)+' days '+f(h)+' hrs';
    if (NT < 93312000) {
      r = f(weeks) + ' weeks ago';
    }
    /*
    if (NT <= 62208000) {
      r = 'more than a year ago';
    }
    if (NT <= 31104000) {
      r = 'some months ago';
    }
    if (NT <= 15552000) {
      r = f(weeks) + ' weeks ago';
    }
    if (NT <= 5184000) {
      r = 'a month ago';
    }
    */
    if (NT <= 2592000) {
      r = f(d) + ' days ago';
    }
    if (NT <= 604800) {
      r = 'this week';
    }
    if (NT <= 172800) {
      r = 'yesterday';
    }
    if (NT <= 86400) {
      r = 'today';
    }
    if (NT < 14400) {
      r = 'a few hours ago';
    }
    if (NT < 600) {
      r = 'a few minutes ago';
    }
    if (NT < 120) {
      r = 'just now';
    }
    return r;
  };
}]);
angular.module('ssv').filter('unsafe', function($sce) {
  return $sce.trustAsHtml;
});
//=============================== CONTROLLERS
angular.module('ssv').directive('ngTumblrNav', function(services, interactions, datastore) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'navigation_template',
    link: function(scope, element, attrs) {
      scope.menusystem01 = menu_unique[0].menuitem;
      scope.menusystem02 = menu_unique[1].menuitem;
      scope.menusystem03 = menu_unique[2].menuitem;
      scope.menusystem04 = menu_unique[3].menuitem;
      //console.log(scope.menusystem01);
      scope.masonry_stag = Theme.masonry_stag;
      scope.featured_stag = Theme.featured_stag;
      // CALLING IN Video Posts 
      services.getPostType(Theme.menu05_type, 4).then(function(data, status, headers, config) {
        scope.videoPosts = data.data.response.posts;
      });
      // CALLING IN Events Tagged Posts 
      services.getAllPosts(0, 3, Theme.menu06_stag).then(function(data, status, headers, config) {
        //console.log('navigation_template1');
        scope.eventPosts = data.data.response.posts;
      });
    },
    controller: function($scope, datastore, $location, interactions, concatService) {
      $scope.$on('DataStoreFeatured', function() {
        $scope.featuredPosts = datastore.featuredPosts;
      });
      $scope.$on('DataStoreMasons', function() {
        $scope.masonPosts = datastore.masonPosts;
      });
      $scope.$on('DataStoreNewest', function() {
        $scope.newestPosts = datastore.newestPosts;
      });
      $scope.resethome = function() {
        $scope.theclasson = 'template-index landing';
        $location.path('/');
        interactions.prepareBroadcastOffsetCounter(0);
        interactions.prepareBroadcastTag();
      };
      $scope.makeActive = function(thispostID, thistag) {
        interactions.prepareBroadcast(thispostID);
        interactions.prepareBroadcastTag(thistag);
        var resetmainData = [];
        concatService.prepBroadcast(resetmainData, true);
        //to do: maybe we can check if the tag has changed before resetting
        interactions.prepareBroadcastOffsetCounter(0);

      };
      $scope.isActive = function(thispostID) {
        return $scope.activepost === thispostID;
      };
    },
    controllerAs: "ngTumblrNavCtrl"
  };
});
angular.module('ssv').directive('ngTumblrPosts', function(interactions, $document, $location, $timeout) {
  return {
    replace: true,
    restrict: 'E',
    scope: {
      activepost: '=',
      firstload: '=',
      offsetorder: '=',
      theclasson: '=',
      activetag: '=', 
      offsetcounter: '='
    },
    templateUrl: 'tumblrposts_template',
    link: function(scope, element, attrs) {
      var path = $location.path();
      if (path === '' || path == '/') {
        scope.firstload = false;
      } else {
        scope.firstload = true;
      }
      ////console.log('ngTumblrPosts called on ',element[0]);
      scope.scrollto = function(elm) {
        var anchorTop = angular.element(document.querySelector('#' + elm + ''));
        var duration = 400; //milliseconds
        var offset = 30; //pixels; adjust for floating menu, context etc
        $document.scrollToElement(anchorTop, offset, duration).then(function() {
          scope.slideToggle('slidee');
          //angular.element(document.querySelector('#loader')).remove();
        });
      };
      scope.slideToggle = function(elm) {
        var slideTarget = angular.element(document.querySelector('#' + elm + ''));
        var curHeight = slideTarget.height(),
          autoHeight = slideTarget.css('height', 'auto').height();
        slideTarget.height(curHeight).animate({
          height: 0
        }, 400, function() {
          slideTarget.height(0).animate({
            height: autoHeight
          }, 400, function() {});
        });
      };
      scope.scrollSlideToggle = function(elm) {
        //console.log('called scrollSlideToggle')
        var anchorTop = angular.element(document.querySelector('#' + elm + ''));
        var slideTarget = angular.element(document.querySelector('#slidee'));
        var duration = 400; //milliseconds
        var offset = 10; //pixels; adjust for floating menu, context etc
        //make sure we show the post on the first load, (from home Page over to any single view)
        if (!slideTarget.length) {
          $timeout(function() {
            scope.firstload = true; // force to true/
          }, duration);
        }
        var curHeight = slideTarget.height(), autoHeight = slideTarget.css('height', 'auto').height();
        slideTarget.height(curHeight).animate({
          height: autoHeight
        }, duration, function() {
          $document.scrollToElement(anchorTop, offset, duration).then(function() {
            scope.firstload = true; // turn to true/
          });
        });
      };
    },
    controller: function($scope, interactions, $location) {
      var path = $location.path();
      if (path === '' || path == '/') {
        $scope.pagehero = true;
        $scope.theclasson = 'template-index landing';
      } else {
        $scope.pagehero = false;
        $scope.theclasson = 'template-product has-related-products-right singlepost';
      }
      $scope.$on('broadcastIdTagAndOrder', function() {
        $scope.activetag = interactions.activetag;
        $scope.activepost = interactions.activePostID;
        $scope.offsetorder = interactions.activePostOrder;
        $scope.scrollSlideToggle('targetsliding');
        $scope.firstload = false; //switch to false
        $scope.pagehero = false;
        $scope.theclasson = 'template-product has-related-products-right singlepost';
      });

      $scope.$on('broadcastOffsetCounter', function(){
        //console.log('offsetcounter is fired');
        $scope.offsetcounter = interactions.offsetcounter;
        console.log('offsetcount ',$scope.offsetcounter);
      });
      //console.log($scope.pagehero)
    },
    controllerAs: "ngTumblrPostsCtrl"
  };
});
angular.module('ssv').directive('ngMasonries', function(services, datastore) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'masonries_template',
    link: function(scope, element, attrs) {
      // CALLING IN MASONRY BLOCKS 
      services.getAllPosts(0, heroFormat, Theme.masonry_stag).then(function(data, status, headers, config) {
        //console.log('masonries_template2');
        scope.masonryPosts = data.data.response.posts;
        datastore.storeMasonsData(scope.masonryPosts);
      });
    },
    controller: function($scope, interactions) {
      $scope.makeActive = function(thispostID) {
        interactions.prepareBroadcast(thispostID);
      };
      $scope.isActive = function(thispostID) {
        return $scope.activepost === thispostID;
      };
    },
    controllerAs: "ngMasonriesCtrl"
  };
});
angular.module('ssv').directive('ngFeatured', function(services, datastore) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'featured_template',
    scope: {},
    link: function(scope, element, attrs) {
      // CALLING IN FEATURED BLOCKS 
      //console.log('featuredFormat is '+featuredFormat);
      services.getPostTypeTagged('photo',0, featuredFormat, Theme.featured_stag).then(function(data, status, headers, config) {
      //services.getAllPosts(0, featuredFormat, Theme.featured_stag).then(function(data, status, headers, config) {
        //console.log('ngFeatured3');
        scope.featuredPosts = data.data.response.posts;
        //store the data for accessing through the main nav
        datastore.storeFeaturedData(scope.featuredPosts);
      });
    },
    controller: function($scope, interactions) {
      $scope.makeActive = function(thispostID) {
        interactions.prepareBroadcast(thispostID);
      };
      $scope.isActive = function(thispostID) {
        return $scope.activepost === thispostID;
      };
    },
    controllerAs: "ngFeaturedCtrl"
  };
});
angular.module('ssv').directive('ngMainPosts', function(services, concatService, interactions) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'mainposts_template',
    scope: {
      activepost: '=',
      showhovers: '=',
      offsetorder: '=',
      activetag :'=',
      offsetcounter:'='
    },
    link: function(scope, element, attrs) {

      scope.offsetcounter = 0;
      //interactions.prepareBroadcastOffsetCounter(scope.offsetcounter);
      scope.storedtag = '';
      scope.thetag = '';

      getAllThePosts = function(){
        services.getAllPostsNoTag(scope.offsetcounter, 12).then(function(data, status, headers, config) {
          mainPosts = data.data.response.posts;
          scope.total_posts = data.data.response.blog.posts;
          if (scope.offsetcounter <= scope.total_posts) {
            concatService.prepBroadcast(mainPosts);
            scope.offsetcounter += 12;
            interactions.prepareBroadcastOffsetCounter(scope.offsetcounter);
          } else {
            //no more posts to load
          }
        });
      };
      getTaggedPosts = function(thetag, reset){
        services.getAllPosts(scope.offsetcounter, 12, thetag).then(function(data, status, headers, config) {
        //console.log('ngMainPosts4');
          mainPosts = data.data.response.posts;
          //scope.total_posts = data.data.response.blog.posts;
          scope.total_posts = data.data.response.total_posts;
          if (scope.offsetcounter <= scope.total_posts) {
            concatService.prepBroadcast(mainPosts, reset);
            scope.offsetcounter += 12;
            interactions.prepareBroadcastOffsetCounter(scope.offsetcounter);
            if (scope.offsetcounter > scope.total_posts){
              scope.offsetcounter = scope.total_posts;
              interactions.prepareBroadcastOffsetCounter(scope.offsetcounter);
            }
          } else {
            //no more posts to load
          }
        });
      };
      scope.showMorePosts = function() {
        //var movable = element[0].getElementsByTagName("li");
        //var ul_elm = document.getElementById("changeableposts");
        //console.log(movable,ul_elm);
        if (scope.activetag){
          //init : defaults to null values, getting equalized
          scope.storedtag = scope.thetag;
          //change the thetag value to match the activetag
          scope.thetag = scope.activetag;
          //init will default to FALSE
          if (scope.storedtag !== scope.thetag){
            /*
            while (ul_elm.firstChild) {
              ul_elm.removeChild(ul_elm.firstChild);
            }
            */
            //console.log('the tag is changed');
            //console.log('scope.storedtag '+scope.storedtag);
            //console.log('scope.thetag '+scope.thetag);
            scope.offsetcounter = 0;
            interactions.prepareBroadcastOffsetCounter(scope.offsetcounter);
            //we should be clearing all the previous lis here...
            getTaggedPosts(scope.thetag, true);
          }
          else{
            //console.log('the tag has NOT changed');
            //console.log('scope.storedtag '+scope.storedtag);
            //console.log('scope.thetag '+scope.thetag);
            getTaggedPosts(scope.thetag, false);
          }
        }
        else{
          getAllThePosts();
        }
      };
    },
    controller: function($scope, services, concatService, interactions) {
      //control the hover up states for the main blocks
      if (showMainBlockHovers) {$scope.showhovers = true;}
      var c = 0;
      var allPosts = [];
      //Broadcast the $scopelist so we can join the JSON objects
      $scope.$on('handleBroadcast', function() {
        console.log('handleBroadcast');
        if (concatService.reset ) {
          c=0;
          //console.log('on handle broadcast I need a RESET');
          //console.log('c is '+c);
        }
        /*
        else{
          console.log('on handle broadcast no need for Reset ');
          console.log('c is '+c);
        }
        */
        c++;
        if (c == 1) {
          $scope.list = concatService.list;
          $scope.extend = concatService.list;
        } else {
          $scope.prevstored = $scope.list;
          $scope.list = $scope.prevstored.concat(concatService.list);
        }
      });
      $scope.makeActive = function(thispostID, thispostOrder) {
        interactions.prepareBroadcast(thispostID, thispostOrder);
      };
      $scope.isActive = function(thispostID, thispostOrder) {
        if ($scope.activepost === thispostID) {
          $scope.offsetorder = thispostOrder;
        }
        return $scope.activepost === thispostID;
      };
        //getting all Posts in the Blog, recursively
      $scope.loadAllPostsProgressively = function(offset, limit, tag) {
        services.getAllPosts(offset, limit, tag).then(function(data, status, headers, config) {
          //console.log('ngMainPosts6');
          $scope.list = data.data.response.posts;
        });
      };
    },
    controllerAs: "ngMainPostsCtrl"
  };
});

angular.module('ssv').directive('dirDisqus', ['$window', function($window) {
        return {
            restrict: 'E',
            scope: {
                disqus_shortname: '@disqusShortname',
                disqus_identifier: '@disqusIdentifier',
                disqus_title: '@disqusTitle',
                disqus_url: '@disqusUrl',
                disqus_category_id: '@disqusCategoryId',
                disqus_disable_mobile: '@disqusDisableMobile',
                disqus_config_language : '@disqusConfigLanguage',
                disqus_remote_auth_s3 : '@disqusRemoteAuthS3',
                disqus_api_key : '@disqusApiKey',
                disqus_on_ready: "&disqusOnReady",
                readyToBind: "@"
            },
            template: '<div id="disqus_thread"></div><a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>',
            link: function(scope) {

                // ensure that the disqus_identifier and disqus_url are both set, otherwise we will run in to identifier conflicts when using URLs with "#" in them
                // see http://help.disqus.com/customer/portal/articles/662547-why-are-the-same-comments-showing-up-on-multiple-pages-
                if (typeof scope.disqus_identifier === 'undefined' || typeof scope.disqus_url === 'undefined') {
                    throw "Please ensure that the `disqus-identifier` and `disqus-url` attributes are both set.";
                }

                scope.$watch("readyToBind", function(isReady) {

                    // If the directive has been called without the 'ready-to-bind' attribute, we
                    // set the default to "true" so that Disqus will be loaded straight away.
                    if ( !angular.isDefined( isReady ) ) {
                        isReady = "true";
                    }
                    if (scope.$eval(isReady)) {
                        console.log('remote'+scope.disqus_remote_auth_s3);
                        // put the config variables into separate global vars so that the Disqus script can see them
                        $window.disqus_shortname = scope.disqus_shortname;
                        $window.disqus_identifier = scope.disqus_identifier;
                        $window.disqus_title = scope.disqus_title;
                        $window.disqus_url = scope.disqus_url;
                        $window.disqus_category_id = scope.disqus_category_id;
                        $window.disqus_disable_mobile = scope.disqus_disable_mobile;
                        $window.disqus_config =  function () {
                            this.language = scope.disqus_config_language;
                            this.page.remote_auth_s3 = scope.disqus_remote_auth_s3;
                            this.page.api_key = scope.disqus_api_key;
                            if (scope.disqus_on_ready) {
                                this.callbacks.onReady = [function () {
                                    scope.disqus_on_ready();
                                }];
                            }
                        };
                        // get the remote Disqus script and insert it into the DOM, but only if it not already loaded (as that will cause warnings)
                        if (!$window.DISQUS) {
                            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                            dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
                            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                        } else {
                            $window.DISQUS.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = scope.disqus_identifier;
                                    this.page.url = scope.disqus_url;
                                    this.page.title = scope.disqus_title;
                                    this.language = scope.disqus_config_language;
                                    this.page.remote_auth_s3=scope.disqus_remote_auth_s3;
                                    this.page.api_key=scope.disqus_api_key;
                                }
                            });
                        }
                    }
                });
            }
        };
    }]);




angular.module('ssv').directive('applypackery', function($rootScope, $timeout) {
  var c = 1;
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if (c === 1 || c === 6 || c === 7 || c === 12) {
        scope.classinstance = 'smallsize';
      }
      if (c === 2 || c === 4 || c === 9 || c === 11) {
        scope.classinstance = 'portraitsize';
      }
      if (c === 3 || c === 10) {
        scope.classinstance = 'largesize';
      }
      if (c === 5 || c === 8) {
        scope.classinstance = 'widesize';
      }
      if (c === 12) {
        c = 0;
      }
      c++;
      ////console.log('c is'+ c);
      if ($rootScope.packery === undefined || $rootScope.packery === null) {
        scope.element = element;
        $rootScope.packery = new Packery(element[0].parentElement, {
          isResizeBound: true,
          //rowHeight: 230,
          //columnWidth: 230,
          itemSelector: '.isotope-item',
          //columnWidth: ".grid-sizer",
          percentPosition: true,
          isOriginTop: true,
          gutter: 0,
          isLayoutInstant: true
        });
        $rootScope.packery.bindResize();
      }
      $timeout(function() {
        $rootScope.packery.reloadItems();
        $rootScope.packery.layout();
      }, 100);
    }
  };
});
angular.module('ssv').directive('imgLoad', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.fitimgs = function() {
        var el = element[0],offsetedImg = true,
          parentel = el.parentElement;
          //console.log(parentel);
        //adjust the image width then check for img height  
        if (el.clientWidth != parentel.clientWidth || el.clientHeight != parentel.clientHeight) {
          newElWidth = parentel.clientWidth; //rounded pixels
          newElHeight = Math.round((parentel.clientWidth * el.clientHeight) / el.clientWidth); // proportionally adjust the height of the image 
          //check if we have a fit after the width transformation, otherwise further adjust by increasing the height
          if (newElHeight < parentel.clientHeight) {
            newElHeight = parentel.clientHeight;
            newElWidth = Math.round((parentel.clientHeight * el.clientWidth) / el.clientHeight);
          }
          //center the images if the new width is bigger than the container's width
          if (newElWidth > parentel.clientWidth) {
            offsetedImg = true;
          } else {
            offsetedImg = false;
          }
          // Apply the scaled image to the element and reset the CSS
          el.height = newElHeight;
          el.width = newElWidth;
          if (!offsetedImg) {
            el.style.cssText = 'min-width:' + newElWidth + 'px;min-height:' + newElHeight + 'px;';
          } else {
            el.style.cssText = 'min-width:' + newElWidth + 'px;min-height:' + newElHeight + 'px;position:relative;left:-' + (newElWidth - parentel.clientWidth) / 2 + 'px;';
          }
        }
      };
      element.on('load', function() {
        scope.fitimgs();
      });
      /*
      angular.element(window).on('resize', function () {
        //console.log('resized');
      });
      */
    }
  };
});
angular.module('ssv').
controller('ngSingleViewCtrl', function($scope, $rootScope, $location, $routeParams, services, interactions, concatService, singleTumblr) {
  var tumblrSingleID = ($routeParams.tumblrSingleID) ? parseInt($routeParams.tumblrSingleID,10) : 0;
  $rootScope.activepost = tumblrSingleID;
  $scope.postdata = singleTumblr.data.response.posts;
  //$scope.postBlogData = singleTumblr.data.response;
  //console.log($scope.postBlogData);
  $scope.tumblrLogged = Theme.tumblrUser;
 
  window.onload = function() {
    $scope.tumblrLogged = Theme.tumblrUser;
    $scope.$apply();
  }

  $scope.total_posts = singleTumblr.data.response.blog.posts;
  console.log($scope.postdata);
  // uniqueIds equals the expected array
  var tagsarray = singleTumblr.data.response.posts[0].tags;
  var tagsarraylen = tagsarray.length;

  for (var i=0; i<tagsarraylen; i++){
    var matchedTag = menuTags.indexOf(tagsarray[i]);
    if (matchedTag !==-1){
      //interactions.prepareBroadcastTag(tagsarray[i]);
      $rootScope.activetag = tagsarray[i];
      console.log('got a match at',tagsarray[i]);
      // Reset the mainPosts 
      //resetMainPosts(tagsarray[i]);
      break;
    }
  }
  //concatService.prepBroadcast(mainPosts, reset);
  //console.log(tagsarray);
  function resetMainPosts (thetag){
    console.log('resetMainPosts called', thetag);
    services.getAllPosts(0, 12, thetag).then(function(data, status, headers, config) {
        //console.log('ngMainPosts4');
          mainPosts = data.data.response.posts;
          console.log(mainPosts);
          concatService.prepBroadcast(mainPosts, true);
        });
  };

  var relatedTag = tagsarray[Math.floor(Math.random() * tagsarraylen)];
  // CALLING IN Related Posts 
  services.getPostTypeTagged('photo', 0, 4, relatedTag).then(function(data, status, headers, config) {
    $scope.relatedPosts  = data.data.response.posts;
    console.log('related ',$scope.relatedPosts);
  });

  $scope.absUrl = $location.absUrl();

  $scope.getNextPrevPost = function(currentorder) {
    //console.log('currentorder is '+currentorder);
    if (currentorder >= 0) {
      services.getAllPostsNoTag(currentorder, 1).then(function(data, status, headers, config) {
        nextPrevPostsId = data.data.response.posts[0].id;
        $location.path('/post/' + nextPrevPostsId + '');
      });
    }
  };
  $scope.swapProductImage = function(imageSrc) {
    //console.log('called on '+imageSrc);
    $rootScope.theimage = imageSrc;
    return $rootScope.theimage;
  };

  $scope.notesTumblr = '';
  $scope.likeRangePercent = '';
  $scope.reblogRangePercent = '';
  var notesload = true;
  $scope.notesFetch = false;

  $scope.getNotes = function(postID) {
    var likeNotes = [];
    var reblogNotes = [];
    if (notesload){
      $scope.notesFetch = true;
      services.getSinglePost(postID,true,true).then(function(data, status, headers, config) {
        $scope.notesFetch = false;
        notesload = false;
        $scope.notesTumblr = data.data.response.posts[0].notes;
        for(var i=0;i<$scope.notesTumblr.length;i++) {
          if (data.data.response.posts[0].notes[i].type == 'like'){
            likeNotes.push(data.data.response.posts[0].notes[i]);
          }
          else{
            reblogNotes.push(data.data.response.posts[0].notes[i]);
          }
        }
        $scope.likes = likeNotes;
        $scope.reblogs = reblogNotes;
        $scope.likeRangePercent = Math.round((likeNotes.length*100)/$scope.notesTumblr.length);
        $scope.reblogRangePercent = Math.round((reblogNotes.length*100)/$scope.notesTumblr.length);
      });
    }
    if (!notesload){
      $scope.notesTumblr = '';
      notesload = true;
    }
  };
});


angular.module('ssv').
controller('ngStaticPageViewCtrl', function($scope, $rootScope, $location) {
  
});

//Form controller for a new Mailchimp subscription.
angular.module('ssv')
  .controller('MailchimpSubscriptionCtrl', ['$log', '$resource', '$scope', '$rootScope',function ($log, $resource, $scope, $rootScope) {
    console.log('MailchimpSubscriptionCtrl',mailchimpVars.username,mailchimpVars.dc);
    // Handle clicks on the form submission.
    $scope.addSubscription = function (mailchimp) {
      var actions,
           MailChimpSubscription,
           params = {},
           url;
      // Create a resource for interacting with the MailChimp API
     // http://elettraministeri.us12.list-manage.com/subscribe/post-json?EMAIL=ssddd@me.com&FNAME=gjhj&LNAME=jhgghj&c=angular.callbacks._7
     //elettraministeri.us12.list-manage.com/subscribe/post?u=971abdc1d1c6be85c4f864b71&amp;id=3f732e61e2
      url = '//' + mailchimpVars.username + '.' + mailchimpVars.dc +'.list-manage.com/subscribe/post-json?u='+mailchimpVars.u+'&amp;id='+mailchimpVars.id+'';
      var fields = Object.keys(mailchimp);
      for(var i = 0; i < fields.length; i++) {params[fields[i]] = mailchimp[fields[i]];}
      params.c = 'JSON_CALLBACK';
      actions = {
        'save': {
          method: 'jsonp'
        }
      };
      MailChimpSubscription = $resource(url, params, actions);
      // Send subscriber data to MailChimp
      MailChimpSubscription.save(
        // Successfully sent data to MailChimp.
        function (response) {
          // Define message containers.
          mailchimp.errorMessage = '';
          mailchimp.successMessage = '';
          // Store the result from MailChimp
          mailchimp.result = response.result;
          // Mailchimp returned an error.
          if (response.result === 'error') {
            if (response.msg) {
              // Remove error numbers, if any.
              var errorMessageParts = response.msg.split(' - ');
              if (errorMessageParts.length > 1)
                errorMessageParts.shift(); // Remove the error number
              mailchimp.errorMessage = errorMessageParts.join(' ');
            } else {
              mailchimp.errorMessage = 'Sorry! An unknown error occured.';
            }
          }
          // MailChimp returns a success.
          else if (response.result === 'success') {
            mailchimp.successMessage = response.msg;
          }
          //Broadcast the result for global msgs
          $rootScope.$broadcast('mailchimp-response', response.result, response.msg);
        },
        // Error sending data to MailChimp
        function (error) {
          $log.error('MailChimp Error: %o', error);
        }
      );
    };
  }]);

// define angular module/app
angular.module('ssv').
controller('formController', function ($scope, $http){
  // create a blank object to hold our form information
  // $scope will allow this to pass between controller and view
  $scope.formData = {};
  $scope.errorEmail = '';
  $scope.errorName = '';
  $scope.errorSurname = '';
  $scope.errorTelefone = '';
  $scope.errorProduct = '';
  // process the form
  $scope.processForm = function() {
    $http({
      method  : 'POST',
      url     : Theme.postURL,
      data    : $.param($scope.formData),  // pass in data as strings
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' },  // set the headers so angular passing info as form data (not request payload)
      dataType: "jsonp" // datatype can be json or jsonp
    })
    .success(function(data) {
      console.log(data);
      if (!data.success) {
        // if not successful, bind errors to error variables
        $scope.errorEmail = data.errors.email;
        $scope.errorName = data.errors.name;
        $scope.errorSurname = data.errors.surname;
        $scope.errorTelefone = data.errors.telefone;
        $scope.errorProduct = data.errors.product;
        console.log(data.errors);
      } else {
        // if successful, bind success message to message
        $scope.message = data.message;
        
      }
    });
  };
});
    
//================================ROUTEPROVIDERS
angular.module('ssv')
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
  $routeProvider
  .when('/', {
    controller: 'ngTumblrPostsCtrl'
  })
  .when('/post/:tumblrSingleID', {
    templateUrl: 'singlepost_template',
    controller: 'ngSingleViewCtrl',
    resolve: {
      singleTumblr: function(services, $route) {
        var tumblrSingleID = $route.current.params.tumblrSingleID;
        return services.getSinglePost(tumblrSingleID);
      }
    }
  })
  .when('/static/:pagename', {
    templateUrl: 'page_template',
    controller: 'ngStaticPageViewCtrl'
  })
  .when('/form/:pagename', {
    templateUrl: 'form_template',
    controller: 'formController'
  })
  .when('/ask', {
    templateUrl: 'ask_template',
    //controller: 'askController'
  })
  .otherwise({
    redirectTo: '/'
  });
  // use the HTML5 History API
  $locationProvider.html5Mode({
    enabled:true,
    requireBase: false
  });
}]);
angular.module('ssv').run(['$rootScope', 'services', 'datastore', function($rootScope, services, datastore) {
  //console.log('run');
  $rootScope.firstload = true;
  $rootScope.activepost = '';
  $rootScope.activetag = '';
  $rootScope.offsetorder = '';
  $rootScope.offsetcounter = 0;
  // CALLING IN Generic Data and most recent Photo Post 
  //services.getAllPostsNoTag(0, 1).then(function(data, status, headers, config) {
  services.getPostType('photo', 1).then(function(data, status, headers, config) {
    $rootScope.recentPost = data.data.response.posts;
    //datastore.storeNewestData($rootScope.recentPost);
    $rootScope.blog_url = data.data.response.blog.url;
    $rootScope.blog_name = data.data.response.blog.name;
    console.log(data.data.response);
    $rootScope.blog_title = data.data.response.blog.title;
    $rootScope.total_posts = data.data.response.blog.posts;
    $rootScope.updated = data.data.response.blog.updated;
    $rootScope.blog_description = data.data.response.blog.description;
  });
}]);










































///////////////////////////////////////////////////////////////////////////////////
//////////////////////backboneus
///////////////////////////////////////////////////////////////////////////////////
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.HeaderView = (function(superClass) {
    extend(HeaderView, superClass);

    function HeaderView() {
      return HeaderView.__super__.constructor.apply(this, arguments);
    }

    HeaderView.prototype.events = {};

    HeaderView.prototype.initialize = function() {
     
      this.body = $(document.body);
      this.window = $(window);
      this.branding = this.$(".branding");
      this.headerTools = this.$(".header-tools");
      this.window.resize((function(_this) {
        return function() {
          ;
          ;
          //return _this.setSearchWidth();
        };
      })(this)).trigger("resize");
      ;
      this.window.on("scroll", (function(_this) {
        return function() {
          if (document.documentElement.offsetWidth > 1020) {
            if (!_this.body.hasClass("alternate-index-layout")) {
              return _this.triggerStickyHeader();
            }
          }
        };
      })(this));
      this.window.resize((function(_this) {
        return function() {
          if (document.documentElement.offsetWidth <= 1020 && !theme.ltIE9) {
            return _this.body.removeClass("sticky-header");
          }
        };
      })(this));
      return ;
    };

    HeaderView.prototype.setSearchWidth = function() {
      var searchWidth;
      searchWidth = this.$(".mini-cart-wrapper").outerWidth() + this.$(".checkout-link").outerWidth();
      this.$(".search-form").width(searchWidth);
      return this.setLogoPadding(searchWidth);
    };

    HeaderView.prototype.setLogoPadding = function(padding) {
      /*
      return this.branding.css({
        "paddingLeft": padding + 60,
        "paddingRight": padding + 60
      });
    */
    };

    ;

    HeaderView.prototype.triggerStickyHeader = function() {
      var branding, cartCount, headerHeight;
      headerHeight = this.$el.outerHeight();
      if (this.window.scrollTop() > headerHeight) {
        this.body.addClass("sticky-header");
      } else {
        this.body.removeClass("sticky-header");
      }
      if (!Modernizr.csstransforms) {
        cartCount = $(".sticky-header .navigation .cart-count");
        cartCount.css({
          "marginTop": -(cartCount.height() / 2)
        });
        branding = $(".sticky-header .navigation .branding");
        return branding.css({
          "marginTop": -(branding.height() / 2)
        });
      }
    };

    ;

    

    return HeaderView;

  })(Backbone.View);

}).call(this);



(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.NavigationView = (function(superClass) {
    extend(NavigationView, superClass);

    function NavigationView() {
      return NavigationView.__super__.constructor.apply(this, arguments);
    }

    NavigationView.prototype.events = {
      //"mouseover .mega-nav-list a": "swapMegaNavImages",
      "click .has-dropdown .enter-linklist": "enterMegaNavTier",
      "click .has-dropdown .back": "exitMegaNavTier",
      //"mouseleave .has-mega-nav": "useDefaultImage"
    };

    NavigationView.prototype.initialize = function() {
      this.body = $(document.body);
      $(".navigation-toggle,.mobile-mega-nav a").on("click", (function(_this) {
        return function() {
          if (_this.body.hasClass("mobile-nav-open")) {
            return _this.toggleMobileNavigation("close");
          } else {
            return _this.toggleMobileNavigation("open");
          }
        };
      })(this));
      this.transitionend = (function(transition) {
        var transEndEventNames;
        transEndEventNames = {
          "-webkit-transition": "webkitTransitionEnd",
          "-moz-transition": "transitionend",
          "-o-transition": "oTransitionEnd",
          transition: "transitionend"
        };
        return transEndEventNames[transition];
      })(Modernizr.prefixed("transition"));
      return $(window).resize((function(_this) {
        return function() {
          _this.setupNavigation();
          if (document.documentElement.offsetWidth > 1020 && _this.body.hasClass("mobile-nav-open")) {
            $(".navigation-wrapper").removeClass("visible");
            _this.toggleMobileNavigation("close");
          }
          if (!Modernizr.csstransforms) {
            return _this.positionMegaNav();
          }
        };
      })(this)).trigger("resize");
    };

    NavigationView.prototype.setupNavigation = function() {
      if (document.documentElement.offsetWidth > 1020 || theme.ltIE9) {
        this.$el.removeClass("mobile").addClass("full-width");
        return this.$("li[data-mega-nav='true']").removeClass("has-dropdown").addClass("has-mega-nav");
      } else {
        this.$el.removeClass("full-width").addClass("mobile");
        return this.$("li[data-mega-nav='true']").removeClass("has-mega-nav").addClass("has-dropdown");
      }
    };

    NavigationView.prototype.swapMegaNavImages = function(e) {
      var image, imageAlt;
      image = this.$(e.target).parent().data("image-src");
      imageAlt = this.$(e.target).parent().data("image-alt");
      return this.$(".mega-nav-image img").attr("src", image).attr("alt", imageAlt);
    };

    NavigationView.prototype.positionMegaNav = function() {
      var megaNav, megaNavWidth;
      megaNav = this.$(".mega-nav");
      megaNavWidth = megaNav.outerWidth();
      return megaNav.css({
        "marginLeft": -(megaNavWidth / 2)
      });
    };

    NavigationView.prototype.toggleMobileNavigation = function(direction) {
      var navigationWrapper;
      navigationWrapper = $(".navigation-wrapper");
      if (direction === "open") {
        this.body.addClass("mobile-nav-open lock-scroll");
        this.$el.addClass("visible");
        navigationWrapper.addClass("visible background");
        this.$("> ul").addClass("in-view active");
        return this.setTierHeight();
      } else if (direction === "close") {
        this.$el.removeAttr("style");
        this.body.removeClass("mobile-nav-open");
        this.$el.removeClass("visible");
        if (Modernizr.csstransitions) {
          return navigationWrapper.removeClass("background").one(this.transitionend, (function(_this) {
            return function() {
              navigationWrapper.removeClass("visible");
              return _this.body.removeClass("lock-scroll");
            };
          })(this));
        } else {
          navigationWrapper.removeClass("background");
          navigationWrapper.removeClass("visible");
          return this.body.removeClass("lock-scroll");
        }
      }
    };

    NavigationView.prototype.enterMegaNavTier = function(e) {
      var targetLinklist;
      if (this.$el.hasClass("mobile")) {
        e.preventDefault();
      }
      targetLinklist = $(e.target).parent().data("linklist-trigger");
      this.$("ul").removeClass("active");
      this.$("ul[data-linklist='" + targetLinklist + "']").addClass("in-view active");
      this.$(e.target).closest("ul").addClass("out-of-view");
      return this.setTierHeight();
    };

    NavigationView.prototype.exitMegaNavTier = function(e) {
      var target;
      target = $(e.target);
      this.$("ul").removeClass("active");
      if (Modernizr.csstransitions) {
        target.closest("ul.out-of-view").removeClass("out-of-view").addClass("active").one(this.transitionend, (function(_this) {
          return function() {
            return target.closest("ul").removeClass("in-view");
          };
        })(this));
      } else {
        target.closest("ul.out-of-view").removeClass("out-of-view").addClass("active");
        target.closest("ul").removeClass("in-view");
      }
      return this.setTierHeight();
    };

    NavigationView.prototype.setTierHeight = function() {
      var brandingHeight, tierHeight, windowHeight;
      this.$el.scrollTop(0);
      windowHeight = window.innerHeight;
      brandingHeight = this.$(".branding").outerHeight();
      tierHeight = this.$("ul.active").outerHeight();
      if (windowHeight > tierHeight + brandingHeight) {
        return this.$el.css({
          "overflow-y": "hidden",
          "max-height": windowHeight,
          "height": "100%"
        });
      } else {
        return this.$el.css({
          "overflow-y": "scroll",
          "max-height": tierHeight + brandingHeight,
          "height": "100%"
        });
      }
    };

    NavigationView.prototype.useDefaultImage = function() {
      var megaNavImage;
      megaNavImage = this.$(".mega-nav-image img");
      return megaNavImage.attr("src", megaNavImage.data("image")).attr("alt", megaNavImage.data("alt"));
    };

    return NavigationView;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.FooterView = (function(superClass) {
    extend(FooterView, superClass);

    function FooterView() {
      return FooterView.__super__.constructor.apply(this, arguments);
    }

    FooterView.prototype.events = {};

    FooterView.prototype.initialize = function() {
      return $(window).resize((function(_this) {
        return function() {
          if (document.documentElement.offsetWidth <= 1020) {
            return _this.setupFooter("mobile");
          } else {
            return _this.setupFooter();
          }
        };
      })(this)).trigger("resize");
    };

    FooterView.prototype.setupFooter = function(layout) {
      if (layout === "mobile") {
        return this.$(".mailing-list").prependTo(".upper-footer");
      } else {
        return this.$(".mailing-list").appendTo(".upper-footer");
      }
    };

    return FooterView;

  })(Backbone.View);

}).call(this);







(function() {
  ;
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.TwitterView = (function(superClass) {
    extend(TwitterView, superClass);

    function TwitterView() {
      return TwitterView.__super__.constructor.apply(this, arguments);
    }

    TwitterView.prototype.events = {};

    TwitterView.prototype.initialize = function() {
      //this.fetchTweets();
      ;
      this.window = $(window);
      this.window.load((function(_this) {
        return function() {
          return _this.window.resize(function() {
            //return _this.setWidgetHeight();
          }).trigger("resize");
        };
      })(this));
      return ;
    };

    return TwitterView;

  })(Backbone.View);

  ;

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.HomeView = (function(superClass) {
    extend(HomeView, superClass);

    function HomeView() {
      return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.events = {
      "click .alternative-masonry-feature, .masonry-feature": "redirectMasonryFeatures"
    
    };


    HomeView.prototype.initialize = function() {
      if (Theme.twitter) {
        new TwitterView({
          el: this.$(".twitter-widget")
        });
      }
      ;
      $(window).resize((function(_this) {
        return function() {
          _this.setupFeaturedCollections();
          if (!Modernizr.csstransforms) {
            return _this.centerFeaturedCollectionText();
          }
        };
      })(this)).trigger("resize");
      
      $(window).resize((function(_this) {
        return function() {
          return _this.positionMasonryFeatureText();
        };
      })(this)).trigger("resize");
      
      this.masonryFeatures = this.$(".masonry-features");
      $(window).resize((function(_this) {
        return function() {
          if (_this.masonryFeatures.hasClass("has-4-features") || _this.masonryFeatures.hasClass("has-5-features") || _this.masonryFeatures.hasClass("has-6-features")) {
            _this.positionMasonryFeatures();
          }
        };
      })(this)).trigger("resize");
      
    };

    

    HomeView.prototype.setupFeaturedCollections = function() {
      var collectionHeight, featuredCollectionImage;
      collectionHeight = 10000;
      featuredCollectionImage = this.$(".featured-collection-image img");
      return this.$(".featured-collections-list").imagesLoaded((function(_this) {
        return function() {
          var collectionImage, i, imageHeight, j, len, len1, results;
          for (i = 0, len = featuredCollectionImage.length; i < len; i++) {
            collectionImage = featuredCollectionImage[i];
            if ($(collectionImage).height() < collectionHeight) {
              collectionHeight = $(collectionImage).height();
            }
          }
          _this.$(".featured-collection-image").height(collectionHeight);
          results = [];
          for (j = 0, len1 = featuredCollectionImage.length; j < len1; j++) {
            collectionImage = featuredCollectionImage[j];
            imageHeight = $(collectionImage).height();
            if (imageHeight > collectionHeight) {
              results.push($(collectionImage).css({
                "marginTop": -(imageHeight - collectionHeight) / 2
              }));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    HomeView.prototype.centerFeaturedCollectionText = function() {
      var collectionText, i, len, ref, results, textHeight, textWidth;
      ref = this.$(".featured-collection-overlay");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        collectionText = ref[i];
        collectionText = $(collectionText);
        textHeight = collectionText.height();
        textWidth = collectionText.outerWidth();
        results.push(collectionText.css({
          "marginTop": -(textHeight / 2),
          "marginLeft": -(textWidth / 2)
        }));
      }
      return results;
    };

    
    HomeView.prototype.redirectMasonryFeatures = function(e) {
      var url;
      url = $(e.target).closest("article").data("url");
      if (url !== "") {
        return window.location = url;
      }
    };


     /*
     $('a[href^="#"]').on('click', function(event) {
    var target = $(this.href);
    if( target.length ) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 1000);
    }
});
*/

 

    

    HomeView.prototype.positionMasonryFeatureText = function() {
      var feature, i, len, ref, results, textHeight, textWidth;
      ref = this.$(".masonry-feature-text");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        feature = ref[i];
        feature = $(feature);
        textHeight = feature.height();
        textWidth = feature.outerWidth();
        results.push(feature.css({
          "marginTop": -(textHeight / 2),
          "marginLeft": -(textWidth / 2)
        }));
      }
      return results;
    };


    HomeView.prototype.positionMasonryFeatures = function() {
      var bumpFeature, containerWidth, offset;
      if (this.masonryFeatures.hasClass("has-4-features") || this.masonryFeatures.hasClass("has-5-features")) {
        bumpFeature = this.$(".feature-3");
      } else if (this.masonryFeatures.hasClass("has-6-features")) {
        bumpFeature = this.$(".feature-4");
      }
      containerWidth = this.masonryFeatures.outerWidth();
      offset = -(containerWidth * 0.074);
      bumpFeature.css({
        "top": offset
      });
      return this.masonryFeatures.css({
        "marginBottom": offset
      });
    };

   

    

    return HomeView;

  })(Backbone.View);

}).call(this);
















(function() {
  var extend = function(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  },
    hasProp = {}.hasOwnProperty;

  window.ThemeView = (function(superClass) {
    extend(ThemeView, superClass);

    function ThemeView() {
      return ThemeView.__super__.constructor.apply(this, arguments);
    }

    ThemeView.prototype.el = document.body;

    ThemeView.prototype.initialize = function() {
      var body;
      body = $(document.body);
      this.ltIE9 = $("html").hasClass("lt-ie9");
      if (navigator.userAgent.indexOf("MSIE 10") !== -1) {
        this.$el.addClass("ie10");
      }
      return $(window).load((function(_this) {
        return function() {
          return body.removeClass("loading");
        };
      })(this));
    };
    ThemeView.prototype.render = function() {
      var i, j, k, len, len1, len2, productItem, ref, ref1, ref2, rte, select;
      new HeaderView({
        el: $(".main-header")
      });
      new NavigationView({
        el: $(".navigation")
      });
      new FooterView({
        el: $("footer")
      });
      new HomeView({
         el: this.$el
      });
      
    };
    return ThemeView;

  })(Backbone.View);

  $(function() {
    window.theme = new ThemeView();
    return theme.render();
  });

}).call(this);