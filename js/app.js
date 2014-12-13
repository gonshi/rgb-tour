(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  function EventDispatcher() {
    this._events = {};
  }

  EventDispatcher.prototype.hasEventListener = function(eventName) {
    return !!this._events[eventName];
  };

  EventDispatcher.prototype.addEventListener = function(eventName, callback) {
    if (this.hasEventListener(eventName)) {
      var events = this._events[eventName];
      for (var i in events) {
        if (events[i] === callback) {
          return;
        }
      }
      events.push(callback);
    }
    else{
      this._events[eventName] = [callback];
    }
    return this;
  };

  EventDispatcher.prototype.removeEventListener = function(eventName, callback) {
    if (!this.hasEventListener(eventName)) {
      return;
    }
    else{
      var events = this._events[eventName],
          i      = events.length,
          index;
      while (i--) {
        if (events[i] === callback) {
          index = i;
        }
      }
      events.splice(index, 1);
    }
    return this;
  };

  EventDispatcher.prototype.fireEvent = function(eventName, opt_this) {
    if (!this.hasEventListener(eventName)) {
      return;
    }
    else{
      var events = this._events[eventName],
      copyEvents = $.merge([], events),
      arg        = $.merge([], arguments);
      arg.splice(0, 2);
      for (var i in copyEvents) {
        copyEvents[i].apply(opt_this || this, arg);
      }
    }
  };

  ns.EventDispatcher = EventDispatcher;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  function Throttle(minInterval) {
    this.interval = minInterval;
    this.prevTime = 0;
    this.timer = function(){};
  }

  Throttle.prototype.exec = function(callback) {
    var now = + new Date(),
        delta = now - this.prevTime;

    clearTimeout(this.timer);
    if( delta >= this.interval ){
      this.prevTime = now;
      callback();
    }
    else{
      this.timer = setTimeout(callback, this.interval);
    }
  };

  ns.Throttle = Throttle;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  var originalConstructor;
  var instance;

  /*
  *  @param {string} id
  *  @return {undefined}
  */

  function GetCountryData(id){
    if(id){
      this.src = 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/basic?alt=json-in-script';
    }
    else{
      console.log('[ERROR] id is not defined');
    }
   }

  originalConstructor = GetCountryData.prototype.constructor;
  GetCountryData.prototype = new ns.EventDispatcher();
  GetCountryData.prototype.constructor = originalConstructor;

  /*
  *  @param {}
  *  @return {undefined}
  */

  GetCountryData.prototype.exec = function(){
    $('head').append( $(document.createElement('script')).attr('src', this.src) );
  };

  GetCountryData.getInstance = function(id) {
    if (!instance) {
      instance = new GetCountryData(id);
    }
    return instance;
  };

  ns.GetCountryData = GetCountryData;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

// google API callback 
var gdata = {
      io: {}
    };
var originalConstructor;

gdata.io.handleScriptLoaded = function(response){
  'use strict';
  var data = response.feed.entry;
  var colorExp = /カラーコード: (.*?),/;
  var nameEngExp = /国名英語表記: (.*?),/;
  var placeIdExp = /placeid: (.*?),/;
  var imgPathExp = /画像url: (.*?),/;
  var latlngExp = /緯度経度: (.*?)$/;
  var eachColorExp = /(#\w*)/g;
  var colors;
  var ns = window.kokki;
  ns.colorList = [];
  ns.countryList = [];

  for(var i = 0; i < data.length; i++){
    ns.countryList[i] = {
      name: data[i].title.$t,
      color: data[i].content.$t.match(colorExp)[1].split('#').splice(1, 3), // separate three color codes by '#', and delete the first ( it'll be empty )
      place_id: data[i].content.$t.match(placeIdExp)[1],
      nameEng: data[i].content.$t.match(nameEngExp)[1],
      imgPath: data[i].content.$t.match(imgPathExp)[1],
      latlng: data[i].content.$t.match(latlngExp)[1].split(':')
    };

    colors = data[i].content.$t.match(eachColorExp);
    ns.colorList = ns.colorList.concat(colors);
  }
  gdata.io.handleScriptLoaded.prototype.fireEvent('LOADED');
};

originalConstructor = gdata.io.handleScriptLoaded.prototype.constructor;
gdata.io.handleScriptLoaded.prototype = new window.kokki.EventDispatcher();
gdata.io.handleScriptLoaded.prototype.constructor = originalConstructor;
/////////////////////

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  var originalConstructor;
  var instance;
  var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6c91ca1e147aafc84b8f0047781440eb&sort=interestingness-desc&place_id=#{place_id}&format=json&licence=1,2,3,4,5,6';

  /*
  *  @param {string} id
  *  @return {undefined}
  */

  function GetFlickrData(){
  }

  originalConstructor = GetFlickrData.prototype.constructor;
  GetFlickrData.prototype = new ns.EventDispatcher();
  GetFlickrData.prototype.constructor = originalConstructor;

  /*
  *  @param {}
  *  @return {undefined}
  */

  GetFlickrData.prototype.exec = function( place_id ){
    var that = this;
    $.ajax({
      type: 'get',
      dataType: 'jsonp',
      url: url.replace( '#{place_id}', place_id )
    });

    global.jsonFlickrApi = function( result ){
      that.fireEvent( 'PHOTO_LOADED', that, result.photos.photo );
    };
  };

  GetFlickrData.getInstance = function( id ) {
    if (!instance) {
      instance = new GetFlickrData(id);
    }
    return instance;
  };

  ns.GetFlickrData = GetFlickrData;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};

  var originalConstructor;
  var instance;

  /*
  *  @param {}
  *  @return {undefined}
  */

  function ClickHandler(){
   }

  originalConstructor = ClickHandler.prototype.constructor;
  ClickHandler.prototype = new ns.EventDispatcher();
  ClickHandler.prototype.constructor = originalConstructor;

  ClickHandler.prototype.layer = function(){
    var that = this;
    var layers = [
      $('.firstLayer'),
      $('.secondLayer'),
      $('.thirdLayer')
    ];
    var i;

    for( i = 0; i < layers.length; i++ ){
      layerClick(i);
    }

    function layerClick(i){
      layers[i].on('click', function(){
        if( !$(this).hasClass('selected') ){
          that.fireEvent('STOP', that, $(this).attr('class') );
        }
      });
    }
  };


  ClickHandler.prototype.reset = function(){
    var that = this;
    $( '.moreBtn' ).on( 'click', function(){
      that.fireEvent( 'RESET' );
    });
  };

  ClickHandler.getInstance = function() {
    if (!instance) {
      instance = new ClickHandler();
    }
    return instance;
  };

  ns.ClickHandler = ClickHandler;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};

  var originalConstructor;
  var instance;
  var $slotContainer = $( '.slotContainer' );

  /*
  *  @param {}
  *  @return {undefined}
  */

  function ResizeHandler(){
   }

  originalConstructor = ResizeHandler.prototype.constructor;
  ResizeHandler.prototype = new ns.EventDispatcher();
  ResizeHandler.prototype.constructor = originalConstructor;

  ResizeHandler.prototype.exec = function(){
    $(window).on( 'load resize', function(){
      $slotContainer.css({ height: $(this).height() });
    });
  };

  ResizeHandler.getInstance = function() {
    if (!instance) {
      instance = new ResizeHandler();
    }
    return instance;
  };

  ns.ResizeHandler = ResizeHandler;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  var originalConstructor;
  var instance;
  var $flagImg = $('.flag').find('img');
  var animationLayer =  [
    $('.firstLayer'),
    $('.secondLayer'),
    $('.thirdLayer')
  ];
  var layerLength = animationLayer.length; 
  var $filter = $( '#filter' );

  /*
  *  @param {number} interval 
  *  @return {undefined}
  */
  
  function Slot(interval){
    this.INTERVAL = interval || 10;
  }

  originalConstructor = Slot.prototype.constructor;
  Slot.prototype = new ns.EventDispatcher();
  Slot.prototype.constructor = originalConstructor;

  /*
   * @param {}
   * @return {undefined}
   */
  Slot.prototype.exec = function(){
    var that = this;
    var colorPattern = 0;
    var frame = 0;
    var maxColorPattern = ns.colorList.length;
    var GAP = [0, 4, 7];
    var i = 0;

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
    function changeColor(){
      if( frame  === that.INTERVAL ){
        for( i = 0; i < layerLength; i++){
          animationLayer[i].css({ 'background-color': ns.colorList[ ( colorPattern + GAP[i] ) % maxColorPattern ] });
        }
        frame = 0;
        colorPattern++;
        if( colorPattern === maxColorPattern ) colorPattern = 0;
      }
      frame++;
      window.requestAnimationFrame(changeColor);
    }
    window.requestAnimationFrame(changeColor);
  };

  /*
  * @param {string}className
  * @return {undefined}
  */
  Slot.prototype.stop = function( className ){
    var that = this;
    var layerNum;
    var layers = ['firstLayer', 'secondLayer', 'thirdLayer'];
    var i;
    var _animationLayer;
    var newImg;
    var newImgWidth;
    var newImgHeight;
    var waitTime = 1000; // time after slot finished

    for( i = 0; i < layerLength; i++ ){
      if( animationLayer[i].attr('class') === className){
        layerNum = i;
        break;
      }
    }
    _animationLayer = animationLayer[layerNum];

    animationLayer.splice(layerNum, 1);
    layerLength--;

    _animationLayer.addClass( 'selected' );
    _animationLayer.css({ 'background-color': '#' + ns.countryList[ ns.nextNum ].color[ layers.indexOf(className) ] });

    // slot has finished
    if( layerLength === 0 ){
      newImg = new Image();
      newImg.onload = function(){ // check size of the flag image
        newImgWidth = newImg.width;
        newImgHeight = newImg.height;
        loadImage();
      };
      newImg.src = ns.countryList[ns.nextNum].imgPath; 
    }

    function loadImage(){
      $flagImg.attr({ src: ns.countryList[ns.nextNum].imgPath });

      if($flagImg.get(0).complete){
        imageLoaded();
      }
      else{
        $flagImg.on('load', imageLoaded); 
      }
    }

    function imageLoaded(){
      setTimeout(function(){
        that.fireEvent('SLOT_FINISHED', that, newImgWidth, newImgHeight);
        $filter.addClass( 'hide' );
      }, waitTime); 
    }
  };

  Slot.prototype.reset = function(){
    animationLayer =  [
      $('.firstLayer'),
      $('.secondLayer'),
      $('.thirdLayer')
    ];
    layerLength = animationLayer.length; 
  };

  Slot.getInstance = function(interval) {
    if (!instance) {
      instance = new Slot(interval);
    }
    return instance;
  };

  ns.Slot = Slot;
  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};
  var $slot = $('.slot');
  var $flag = $('.flag');
  var $flagImg = $flag.find('img');
  var $countryName = $('.countryName .text');
  var $countryFlagWiki = $('.countryFlagWiki .sentence');

  /*
   * @param {number}newImgWidth, {number}newImgHeight, {number}duration(optional)
   * @return {undefined}
   */
  ns.showCountryContents = function(newImgWidth, newImgHeight, duration){
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var winRatio = winHeight / winWidth;
    var imgRatio = newImgHeight / newImgWidth;
    var imgTargetWidth;
    var imgTargetHeight;
    var marginTop = 0;
    duration = duration || 1000;

    if( winRatio >= imgRatio ){ // win vertical length is longer than the img one
      imgTargetWidth = winWidth / 2;
      imgTargetHeight = imgTargetWidth * imgRatio;
      marginTop = ( winHeight / 2 - imgTargetHeight ) / 2;
    }
    else{
      imgTargetHeight = winHeight / 2;
      imgTargetWidth = imgTargetHeight / imgRatio;
    }

    // fade animation from slot to flag
    $slot.animate({
      width: winWidth / 2,
      height: winHeight / 2,
      opacity: 0
    }, duration, function(){
      $slot.css({display: 'none'});
      drawMap();
    });

    $flag.
      css({ opacity: 0 }).
      animate({
        width: winWidth / 2,
        height: winHeight / 2,
        opacity: 1
    }, duration);

    $flagImg.animate({
      width: imgTargetWidth,
      height: imgTargetHeight,
      marginTop: marginTop
    }, duration);
    ////////////////////////////////
    
    function drawMap() {
      var waitTime = 1000;
      var latlng = new global.google.maps.LatLng(ns.countryList[ ns.nextNum ].latlng[0], ns.countryList[ ns.nextNum ].latlng[1]);
      var mapOptions = {
        center: latlng,
        zoom: 3,
        mapTypeId: global.google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        overviewMapControl: false,
        streetViewControl : false,
        mapTypeControl    : false,
        draggable         : false,
        disableDefaultUI  : true,
      };
      var map = new global.google.maps.Map(document.getElementById("map"), mapOptions);
      $('#map').addClass('show');

      setTimeout(function(){
        new global.google.maps.Marker({
          animation: global.google.maps.Animation.DROP,
          position: latlng,
          map: map
        });

        showCountryName();
        showCountryFlagWiki();
      }, waitTime); 
    }

    function showCountryName(){
      $countryName.
        css( {
          width: winWidth / 2,
          height: winHeight / 2
        } ).
        text( ns.countryList[ ns.nextNum ].name ).
        addClass('show');
    }

    function showCountryFlagWiki(){

      $.ajax({
        type: 'get',
        dataType: 'jsonp',
        url: 'http://ja.wikipedia.org/w/api.php?action=query&format=json&titles=' + ns.countryList[ ns.nextNum ].name + 'の国旗&prop=extracts&redirects=1&exchars=120&explaintext=1',
        success: function( result ){
          for( var j in result.query.pages ){
            if( result.query.pages.hasOwnProperty(j) && result.query.pages[j].extract ){

              $countryFlagWiki.
                css({
                  width: winWidth / 2,
                  height: winHeight / 2
                }).
                text( result.query.pages[j].extract ).
                addClass( 'show' );
              break;

            }
          }
        }
      });

    }
  };

  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};
  var photoTmpl = [ 
    '<div class="photo">',
      '<p>',
        '<img src="${photoSrc}" alt="写真">',
      '</p>',
      '<p class="photo_copyright">',
        '<a href="https://www.flickr.com/photos/${copyright}" target="_blank">',
          '&copy;${copyright}',
        '</a>',
      '</p>',
    '</div>'
  ].join("");
  var photoSrcTmpl = 'https://farm#{farm}.staticflickr.com/#{server}/#{id}_#{secret}_n.jpg'; 
  var $photoContainer = $( '.photoContainer' );
  var $photoTitle = $( '.photoTitle' );
  var $loader = $( '.loader' );
  var $arrow  = $( '.arrow' );
  var $moreBtn = $( '.moreBtn' );
  var $footer  = $( '#footer' );

  /*
   * @param {Object}photos
   * @return {undefined}
   */
  ns.showPhotos = function( photos ){
    var i = 0;
    //var photosLength = photos.length;
    var photosLength = 40;
    var maxColumnNum = 3;
    var columnNum;
    var photoMargin = $(window).width() * 0.025;
    var photoWidth = $(window).width() * 0.3;
    var photoDOM;
    var left;
    var newImg = [];
    var imgHeight = [];
    var maxHeight = 0;
    var loadedCount = 0;

    var setImgTop = function( i ){
      var j;
      var sumHeight = 0;
      var start = i % maxColumnNum;

      imgHeight[ i ] = newImg[ i ].height * ( photoWidth / newImg[ i ].width );

      for ( j = start; j < photosLength; j += maxColumnNum ){
        if( !isNaN( imgHeight[ j ] ) ){
          sumHeight += imgHeight[ j ] + photoMargin;
        }

        if ( j < photosLength - maxColumnNum ){
          $( '.photo' ).eq( j + maxColumnNum ).css({ top: sumHeight });
        }
      }

      if ( sumHeight > maxHeight ){
        maxHeight = sumHeight;
      }

      loadedCount += 1;
      if ( loadedCount === photosLength ){
        $photoContainer.css({ height: maxHeight + 200 });
        $photoTitle.text( ns.countryList[ ns.nextNum ].name + 'の風景' ).show();
        $loader.removeClass( 'show' );
        $arrow.show();
        $footer.addClass( 'show' );

        if( ns.countryList.length > 1 ){
          $moreBtn.addClass( 'show' );
        }
        window.scrollTo(0, 1);

        $( window ).on( 'scroll', function(){
          if ( $( window ).scrollTop() > 100 ){
            $( window ).off( 'scroll' );
            $arrow.hide();
          }
        } );
      }
    };

    var imageLoader = function( i ){
      newImg[ i ] = new Image();
      newImg[ i ].onload = function(){
        setImgTop( i ); 
      };
      newImg[ i ].src = photoSrcTmpl.
        replace( '#{farm}', photos[ i ].farm ). 
        replace( '#{server}', photos[ i ].server ). 
        replace( '#{id}', photos[ i ].id ). 
        replace( '#{secret}', photos[ i ].secret );
    };

    $loader.addClass( 'show' );
    for ( i = 0; i < photosLength; i++ ){
      imageLoader( i );

      // set photo css property
      columnNum = i % maxColumnNum;

      if ( columnNum === 0 ){
        left = photoMargin;
      }
      else if( columnNum === 1 ){
        left = photoWidth + photoMargin * 2;
      }
      else if( columnNum === 2 ){
        left = photoWidth * 2 + photoMargin * 3;
      }
      ////////////////////////////

      photoDOM = photoTmpl.replace( '${photoSrc}', newImg[ i ].src ).
                           replace( /\${copyright}/g, photos[ i ].owner );

      $( photoDOM ).
        css({ left: left, width: photoWidth }).
        appendTo('.photoContainer');
    }
   };

  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};
  var $photoContainer = $( '.photoContainer' );
  var $photoTitle = $( '.photoTitle' );
  var $countryName = $( '.countryName .text' );
  var $countryFlagWiki = $( '.countryFlagWiki .sentence' );
  var $filter = $( '#filter' );
  var $map = $( '#map' );
  var $slot = $( '.slot' );
  var $flag = $( '.flag' );
  var $flagImg = $( '.flag img' );
  var $moreBtn = $( '.moreBtn' );
  var $layers = $( '.firstLayer, .secondLayer, .thirdLayer' );
  var $footer = $( '#footer' );

  ns.reset = function(){
    $flag.attr({ src: 'img/flag/white.jpg' });

    $slot.css({
      display: 'block',
      width: '100%',
      height: '100%',
      opacity: 1
    });

    $flag.css({
      width: '100%',
      height: '100%',
      opacity: 0
    });

    $flagImg.
      css({
        width: 'inherit',
        height: 'inherit',
        marginTop: 0
      }).
      attr({ src: 'img/flag/white.jpg' });

    $( '.slot').find( '.stop button' ).
      removeClass( 'delete' );

    $map.empty();
    $countryName.text( '' );
    $countryFlagWiki.text( '' );
    $photoContainer.empty().css({ height: 0, marginTop: 0 });
    $photoTitle.text( '' ).hide();
    $moreBtn.removeClass( 'show' );
    $footer.removeClass( 'show' );
    $filter.removeClass( 'hide' );
    $layers.removeClass( 'selected' );
    window.scrollTo(0, 0);
  };

  global.kokki = ns;
})(this, document, jQuery, this.kokki);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};

  $(function() {
    var getCountryData = ns.GetCountryData.getInstance( '1LoCcYSg8J3SYsa2mYmieu9h5osw7by9GJc8F1OHIbZM' );
    var getFlickrData = ns.GetFlickrData.getInstance();
    var slot = ns.Slot.getInstance(10); // param is interval
    var clickHandler = ns.ClickHandler.getInstance();
    var resizeHandler = ns.ResizeHandler.getInstance();

    // get country data from spread sheet
    global.gdata.io.handleScriptLoaded.prototype.addEventListener( 'LOADED', function(){
      setNext();
      slot.exec();
    });
    ////////////////////////////////////
    
    // click handler
    clickHandler.addEventListener( 'STOP', function( className ){
      $( '.slot .' + className ).find( '.stop button' ).
        addClass( 'delete' );
      slot.stop( className );
    });

    clickHandler.addEventListener( 'RESET', function(){
      ns.reset();
      ns.countryList.splice( ns.nextNum, 1 );
      setNext();
      slot.reset();
    });
    //////////////////////

    // after slot has finished
    slot.addEventListener( 'SLOT_FINISHED', function( newImgWidth, newImgHeight ){
      ns.showCountryContents( newImgWidth, newImgHeight );
      getFlickrData.exec( ns.countryList[ ns.nextNum ].place_id );
    });
    ///////////////////////////

    // flickr image has loaded 
    getFlickrData.addEventListener( 'PHOTO_LOADED', function( photos ){
      ns.showPhotos( photos );
    });

    // INIT
    getCountryData.exec();
    clickHandler.layer();
    clickHandler.reset();
    resizeHandler.exec();

    function setNext(){
      ns.nextNum = Math.floor( Math.random() * ns.countryList.length );
    }
  });

  global.kokki = ns;
})(this, document, jQuery, this.kokki);
