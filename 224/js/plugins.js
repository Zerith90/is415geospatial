/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function (factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined') {
			throw new Error('Leaflet must be loaded first');
        }
		factory(window.L);
	}
}(function (L) {
	'use strict';

	L.Control.Zoomslider = (function () {

		var Knob = L.Draggable.extend({
			initialize: function (element, stepHeight, knobHeight) {
				L.Draggable.prototype.initialize.call(this, element, element);
				this._element = element;

				this._stepHeight = stepHeight;
				this._knobHeight = knobHeight;

				this.on('predrag', function () {
					this._newPos.x = 0;
					this._newPos.y = this._adjust(this._newPos.y);
				}, this);
			},

			_adjust: function (y) {
				var value = Math.round(this._toValue(y));
				value = Math.max(0, Math.min(this._maxValue, value));
				return this._toY(value);
			},

			// y = k*v + m
			_toY: function (value) {
				return this._k * value + this._m;
			},
			// v = (y - m) / k
			_toValue: function (y) {
				return (y - this._m) / this._k;
			},

			setSteps: function (steps) {
				var sliderHeight = steps * this._stepHeight;
				this._maxValue = steps - 1;

				// conversion parameters
				// the conversion is just a common linear function.
				this._k = -this._stepHeight;
				this._m = sliderHeight - (this._stepHeight + this._knobHeight) / 2;
			},

			setPosition: function (y) {
				L.DomUtil.setPosition(this._element,
									  L.point(0, this._adjust(y)));
			},

			setValue: function (v) {
				this.setPosition(this._toY(v));
			},

			getValue: function () {
				return this._toValue(L.DomUtil.getPosition(this._element).y);
			}
		});

		var Zoomslider = L.Control.extend({
			options: {
				position: 'topleft',
				// Height of zoom-slider.png in px
				stepHeight: 8,
				// Height of the knob div in px (including border)
				knobHeight: 6,
				styleNS: 'leaflet-control-zoomslider'
			},

			onAdd: function (map) {
				this._map = map;
				this._ui = this._createUI();
				this._knob = new Knob(this._ui.knob,
									  this.options.stepHeight,
									  this.options.knobHeight);

				map.whenReady(this._initKnob,        this)
					.whenReady(this._initEvents,      this)
					.whenReady(this._updateSize,      this)
					.whenReady(this._updateKnobValue, this)
					.whenReady(this._updateDisabled,  this);
				return this._ui.bar;
			},

			onRemove: function (map) {
				map.off('zoomlevelschange',         this._updateSize,      this)
					.off('zoomend zoomlevelschange', this._updateKnobValue, this)
					.off('zoomend zoomlevelschange', this._updateDisabled,  this);
			},

			_createUI: function () {
				var ui = {},
					ns = this.options.styleNS;

				ui.bar     = L.DomUtil.create('div', ns + ' leaflet-bar');
				ui.zoomIn  = this._createZoomBtn('in', 'top', ui.bar);
				ui.wrap    = L.DomUtil.create('div', ns + '-wrap leaflet-bar-part', ui.bar);
				ui.zoomOut = this._createZoomBtn('out', 'bottom', ui.bar);
				ui.body    = L.DomUtil.create('div', ns + '-body', ui.wrap);
				ui.knob    = L.DomUtil.create('div', ns + '-knob');

				L.DomEvent.disableClickPropagation(ui.bar);
				L.DomEvent.disableClickPropagation(ui.knob);

				return ui;
			},
			_createZoomBtn: function (zoomDir, end, container) {
				var classDef = this.options.styleNS + '-' + zoomDir +
						' leaflet-bar-part' +
						' leaflet-bar-part-' + end,
					link = L.DomUtil.create('a', classDef, container);

				link.href = '#';
				link.title = 'Zoom ' + zoomDir;

				L.DomEvent.on(link, 'click', L.DomEvent.preventDefault);

				return link;
			},

			_initKnob: function () {
				this._knob.enable();
				this._ui.body.appendChild(this._ui.knob);
			},
			_initEvents: function () {
				this._map
					.on('zoomlevelschange',         this._updateSize,      this)
					.on('zoomend zoomlevelschange', this._updateKnobValue, this)
					.on('zoomend zoomlevelschange', this._updateDisabled,  this);

				L.DomEvent.on(this._ui.body,    'click', this._onSliderClick, this);
				L.DomEvent.on(this._ui.zoomIn,  'click', this._zoomIn,        this);
				L.DomEvent.on(this._ui.zoomOut, 'click', this._zoomOut,       this);

				this._knob.on('dragend', this._updateMapZoom, this);
			},

			_onSliderClick: function (e) {
				var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
					y = L.DomEvent.getMousePosition(first, this._ui.body).y;

				this._knob.setPosition(y);
				this._updateMapZoom();
			},

			_zoomIn: function (e) {
				this._map.zoomIn(e.shiftKey ? 3 : 1);
			},
			_zoomOut: function (e) {
				this._map.zoomOut(e.shiftKey ? 3 : 1);
			},

			_zoomLevels: function () {
				var zoomLevels = this._map.getMaxZoom() - this._map.getMinZoom() + 1;
				return zoomLevels < Infinity ? zoomLevels : 0;
			},
			_toZoomLevel: function (value) {
				return value + this._map.getMinZoom();
			},
			_toValue: function (zoomLevel) {
				return zoomLevel - this._map.getMinZoom();
			},

			_updateSize: function () {
				var steps = this._zoomLevels();

				this._ui.body.style.height = this.options.stepHeight * steps + 'px';
				this._knob.setSteps(steps);
			},
			_updateMapZoom: function () {
				this._map.setZoom(this._toZoomLevel(this._knob.getValue()));
			},
			_updateKnobValue: function () {
				this._knob.setValue(this._toValue(this._map.getZoom()));
			},
			_updateDisabled: function () {
				var zoomLevel = this._map.getZoom(),
					className = this.options.styleNS + '-disabled';

				L.DomUtil.removeClass(this._ui.zoomIn,  className);
				L.DomUtil.removeClass(this._ui.zoomOut, className);

				if (zoomLevel === this._map.getMinZoom()) {
					L.DomUtil.addClass(this._ui.zoomOut, className);
				}
				if (zoomLevel === this._map.getMaxZoom()) {
					L.DomUtil.addClass(this._ui.zoomIn, className);
				}
			}
		});

		return Zoomslider;
	})();

	L.Map.addInitHook(function () {
		if (this.options.zoomsliderControl) {
			this.zoomsliderControl = new L.Control.Zoomslider();
			this.addControl(this.zoomsliderControl);
		}
	});

	L.control.zoomslider = function (options) {
		return new L.Control.Zoomslider(options);
	};
}));

(function (factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined')
			throw 'Leaflet must be loaded first';
		factory(window.L);
	}
}(function (L) {
	'use strict';
	L.Control.Pan = L.Control.extend({
		options: {
			position: 'topleft',
			panOffset: 500
		},

		onAdd: function (map) {
			var className = 'leaflet-control-pan',
				container = L.DomUtil.create('div', className),
				off = this.options.panOffset;

			this._panButton('Up'   , className + '-up',
							container, map, new L.Point(    0 , -off));
			this._panButton('Left' , className + '-left',
							container, map, new L.Point( -off ,  0));
			this._panButton('Right', className + '-right',
							container, map, new L.Point(  off ,  0));
			this._panButton('Down' , className + '-down',
							container, map, new L.Point(    0 ,  off));

			// Add pan control class to the control container
			var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
			if(!L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
				L.DomUtil.addClass(controlContainer, 'has-leaflet-pan-control');
			}

			return container;
		},

		onRemove: function (map) {
			// Remove pan control class to the control container
			var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
			if(L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
				L.DomUtil.removeClass(controlContainer, 'has-leaflet-pan-control');
			}
		},

		_panButton: function (title, className, container, map, offset) {
			var wrapper = L.DomUtil.create('div', className + '-wrap', container);
			var link = L.DomUtil.create('a', className, wrapper);
			link.href = '#';
			link.title = title;
			L.DomEvent
				.on(link, 'click', L.DomEvent.stopPropagation)
				.on(link, 'click', L.DomEvent.preventDefault)
				.on(link, 'click', function(){ map.panBy(offset); }, map)
				.on(link, 'dblclick', L.DomEvent.stopPropagation);

			return link;
		}
	});

	L.Map.mergeOptions({
		panControl: false
	});

	L.Map.addInitHook(function () {
		if (this.options.panControl) {
			this.panControl = new L.Control.Pan();
			this.addControl(this.panControl);
		}
	});

	L.control.pan = function (options) {
		return new L.Control.Pan(options);
	};

	return L.Control.Pan;
}));
L.Control.MiniMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: false,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		collapsedWidth: 19,
		collapsedHeight: 19,
		aimingRectOptions: {color: "#ff7800", weight: 1, clickable: false},
		shadowRectOptions: {color: "#000000", weight: 1, clickable: false, opacity:0, fillOpacity:0}
	},
	
	hideText: 'Hide MiniMap',
	
	showText: 'Show MiniMap',
	
	//layer is the map layer to be shown in the minimap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		//Make sure the aiming rects are non-clickable even if the user tries to set them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},
	
	onAdd: function (map) {

		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


		this._miniMap = new L.Map(this._container,
		{
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
			crs: map.options.crs
		});

		this._miniMap.addLayer(this._layer);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
		this._mainMapMoving = false;
		this._miniMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._miniMap.whenReady(L.Util.bind(function () {
			this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
			this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);
			this._mainMap.on('moveend', this._onMainMapMoved, this);
			this._mainMap.on('move', this._onMainMapMoving, this);
			this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
			this._miniMap.on('move', this._onMiniMapMoving, this);
			this._miniMap.on('moveend', this._onMiniMapMoved, this);
		}, this));

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
		this._setDisplay(this._decideMinimized());
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._miniMap.off('moveend', this._onMiniMapMoved, this);

		this._miniMap.removeLayer(this._layer);
	},
	
	changeLayer: function (layer) {
           this._miniMap.removeLayer(this._layer);
           this._layer = layer;
           this._miniMap.addLayer(this._layer);
    },

	_addToggleButton: function () {	
		this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', this.hideText, ('leaflet-control-minimap-toggle-display leaflet-control-minimap-toggle-display-' 
				+ this.options.position), this._container, this._toggleDisplayButtonClicked, this) : undefined;
		
		this._toggleDisplayButton.style.width = this.options.collapsedWidth + 'px';
		this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize != this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the minimap
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.collapsedWidth + 'px';
			this._container.style.height = this.options.collapsedHeight + 'px';
			this._toggleDisplayButton.className += (' minimized-' + this.options.position);
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace('minimized-'  + this.options.position, '');
		}
		else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._miniMapMoving) {
			this._mainMapMoving = true;
			this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._miniMapMoving = false;
		}
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMiniMapMoveStarted:function (e) {
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw:sw,ne:ne};
	},

	_onMiniMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
			this._shadowRect.setStyle({opacity:1,fillOpacity:0.3});
		}
	},

	_onMiniMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._miniMapMoving = true;
			this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity:0,fillOpacity:0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_decideZoom: function (fromMaintoMini) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoMini)
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			else {
				var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;
				
				if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
					//This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
					if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
						//This means the user is trying to zoom in by using the minimap, zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						//Also we cheat and zoom the minimap out again to keep it visually consistent.
						this._miniMap.setZoom(this._miniMap.getZoom() -1);
					} else {
						//Either the user is trying to zoom out past the mini map's min zoom or has just panned using it, we can't tell the difference.
						//Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					//This is what happens in the majority of cases, and always if you configure the min levels + offset in a sane fashion.
					toRet = proposedZoom;
				}
				this._lastMiniMapZoom = this._miniMap.getZoom();
				return toRet;
			}
		} else {
			if (fromMaintoMini)
				return this.options.zoomLevelFixed;
			else
				return this._mainMap.getZoom();
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	}
});

L.Map.mergeOptions({
	miniMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.miniMapControl) {
		this.miniMapControl = (new L.Control.MiniMap()).addTo(this);
	}
});

L.control.minimap = function (layer, options) {
	return new L.Control.MiniMap(layer, options);
};
L.AnimatedMarker = L.Marker.extend({
  options: {
    // meters
    distance: 200,
    // ms
    interval: 1000,
    // animate on add?
    autoStart: true,
    // callback onend
    onEnd: function(){},
    clickable: false
  },

  initialize: function (latlngs, options) {
    this.setLine(latlngs);
    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  },

  // Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
  // are not supported.
  _chunk: function(latlngs) {
    var i,
        len = latlngs.length,
        chunkedLatLngs = [];

    for (i=1;i<len;i++) {
      var cur = latlngs[i-1],
          next = latlngs[i],
          dist = cur.distanceTo(next),
          factor = this.options.distance / dist,
          dLat = factor * (next.lat - cur.lat),
          dLng = factor * (next.lng - cur.lng);

      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      } else {
        chunkedLatLngs.push(cur);
      }
    }
    chunkedLatLngs.push(latlngs[len-1]);

    return chunkedLatLngs;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    // Start animating when added to the map
    if (this.options.autoStart) {
      this.start();
    }
  },

  animate: function() {
    var self = this,
        len = this._latlngs.length,
        speed = this.options.interval;

    // Normalize the transition speed from vertex to vertex
    if (this._i < len) {
      speed = this._latlngs[this._i-1].distanceTo(this._latlngs[this._i]) / this.options.distance * this.options.interval;
    }

    // Only if CSS3 transitions are supported
    if (L.DomUtil.TRANSITION) {
      if (this._icon) { this._icon.style[L.DomUtil.TRANSITION] = ('all ' + speed + 'ms linear'); }
      if (this._shadow) { this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + speed + 'ms linear'; }
    }

    // Move to the next vertex
    this.setLatLng(this._latlngs[this._i]);
    this._i++;

    // Queue up the animation to the next next vertex
    this._tid = setTimeout(function(){
      if (self._i === len) {
        self.options.onEnd.apply(self, Array.prototype.slice.call(arguments));
      } else {
        self.animate();
      }
    }, speed);
  },

  // Start the animation
  start: function() {
    this.animate();
  },

  // Stop the animation in place
  stop: function() {
    if (this._tid) {
      clearTimeout(this._tid);
    }
  },

  setLine: function(latlngs){
    if (L.DomUtil.TRANSITION) {
      // No need to to check up the line if we can animate using CSS3
      this._latlngs = latlngs;
    } else {
      // Chunk up the lines into options.distance bits
      this._latlngs = this._chunk(latlngs);
      this.options.distance = 10;
      this.options.interval = 30;
    }
    this._i = 1;
  }

});

L.animatedMarker = function (latlngs, options) {
  return new L.AnimatedMarker(latlngs, options);
};