// load Google Feeds
google.load("feeds", "1");

var RDR = RDR || {};

// variables
RDR.screenWidth = window.innerWidth;
RDR.art = ''; // holds articles

// menu controls
RDR.menu = {

	open : function () {

		var pan = {},
			cDisplay = (RDR.screenWidth <= 600) ? 'none' : 'table-cell';

		$('#feeds, #articles').css({'display' : 'table-cell'});
		$('#content-con').css({'display' : cDisplay});
		$('#hdr .tog').text('Close Menus >>').removeClass('closed');

	},

	close : function () {

		$('#feeds, #articles').css({'display' : 'none'});
		$('#content-con').css({'display' : 'table-cell'});
		$('#hdr .tog').text('<< Open Menus').addClass('closed');

	},

	check : function () {

		var $tog = $('#hdr .tog'),
			toggle = !$tog.hasClass('closed') ? 'open' : 'close';
		this[toggle]();

	},

	toggle : function (tog) {

		var toggle = $(tog).hasClass('closed') ? 'open' : 'close';
		this[toggle]();

	}

};

// bind events
RDR.bindEvents = function () {

    // handle selecting feeds
	$('nav').on('click', 'a', function (e) {
		e.preventDefault();

		// toggle active state
		$('nav a.active').removeClass('active');
		$(this).addClass('active');

		RDR.articles.loadArticleList(this.href);
	});

	// set first nav item to active
	$('#feeds li:first-child a').addClass('active');

	// handle selecting articles
	$('#articles').on('click', 'a', function (e) {
		e.preventDefault();

		var id = $(this).data('id'),
			link = this;

		RDR.articles.loadArticle(id, link);
	});

	// handle orientation change
	$(window).bind('orientationchange', function (e) {
		RDR.adapt.setHeight();
	});

	// handle resize
	$(window).resize(function (e) {
		RDR.screenWidth = window.innerWidth;
		RDR.adapt.setHeight();
		RDR.menu.check();
	});

	// handle menu toggler
	$('#hdr').on('click', '.tog', function (e) {
		e.preventDefault();
		RDR.menu.toggle(this);
	});

	/* Touch Events */
	var el, hammertime2, hammertime3;

	el = document.getElementById('wrapper');

	// swipe left, close menus
    Hammer(el).on('swipeleft', function () {
		RDR.menu.close();
    });

	// swipe left, close menus
    Hammer(el).on('swiperight', function () {
		RDR.menu.open();
    });

};


RDR.articles = {

	// load first article
	loadFirst : function () {

		var link = $('#articles article:first-child a'),
			id = $(link).data('id');

		this.loadArticle(id, link, true);

	},

	// load select article
	loadArticle : function (id, link, isFirst) {

		var anchor, date;

		$('#articles a.active').removeClass('active');
		$(link).addClass('active');

		anchor = $(link).clone();

		$('.date', anchor).remove();
		date  = $('.date', link).text();

		$('#content').fadeOut(250, function () {
			$('#content-con .content-title').html(anchor);
			$('#content-con .content-date').text(date);
			$(this).html(RDR.art[id].content).fadeIn(250);
		});

		if (window.innerWidth < 600 && !isFirst) {
			RDR.menu.close();
		} else if (window.innerWidth < 600 && isFirst) {
			RDR.menu.open();
		}

	},

	// populate article list
	loadArticleList : function (url, fn) {

		var loadFirst, feed, $firstFeed;

		// load first feed if none is defined
		if (url === undefined || !url) {
			loadFirst = true;
			$firstFeed = $('#feeds a:first');
			url = $firstFeed.attr('href');
			$firstFeed.addClass('active');
		}

		// init google feeds
		feed = new google.feeds.Feed(url);
		feed.setNumEntries(20);

		// load feeds
		feed.load(function (result) {

			if (!result.error) {

				$('#articles').fadeOut(250, function () {

					var list = [], li, articles, entry, date, i;

					for (i = 0; i < result.feed.entries.length; i++) {
						entry = result.feed.entries[i];
						date = entry.publishedDate.replace('-0700', '');
						li = '<article><a href="' + entry.link + '" class="acc-hdr" data-id="' + i + '"><p class="title">' + entry.title + '</p><p class="date">' + date + '</p></a></article>';
						list.push(li);
					}

					articles = list.join('');

					$('#articles').html(articles).fadeIn(250, function () {

						RDR.art = result.feed.entries;

						$(this).animate({scrollTop: '0px'}, {duration: 0, easing: 'swing'});

						if (loadFirst) {
							RDR.articles.loadFirst();
						}

					});

				});

				RDR.adapt.setHeight();

			}

		});

		if (fn) {
			fn();
		}

	}

};


RDR.adapt = {

	// adapt column heights
	setHeight : function () {

		var hdrHeight, screenHeight, screenWidth, winHeight, winWidth;

		hdrHeight = $('#hdr').height();
		hdrHeight = hdrHeight + 11;

		screenHeight = window.innerHeight;
		$('#container .col').css({'height' : screenHeight - hdrHeight});

	}

};

// lets punch it
$(function () {

	RDR.articles.loadArticleList(false, function () {
		RDR.bindEvents();
	});

});