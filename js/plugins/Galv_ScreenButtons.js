//-----------------------------------------------------------------------------
//  Galv's Screen Buttons
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ScreenButtons.js
//-----------------------------------------------------------------------------
//  2017-01-06 - Version 1.3 - fixed a bug with mouse move enabled and no
//                             button with id 0
//  2016-12-15 - Version 1.2 - fixed a bug I created fixing the other bug
//  2016-12-13 - Version 1.1 - fixed a bug with mobile touch going into menus
//  2016-11-30 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ScreenButtons = true;

var Galv = Galv || {};                  // Galv's main object
Galv.SBTNS = Galv.SBTNS || {};          // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.3) Show buttons on screen that can be touched or clicked.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Precache Buttons
 * @desc A list of image names from /img/system/ for your buttons you wish to use should be precached
 * @default BtnUp,BtnDown,BtnRight,BtnLeft,BtnOk,BtnCancel
 *
 * @param Disable Mouse Move
 * @desc Disable moving character on the map with mouse click true/false
 * @default true
 *
 * @param Button Fade
 * @desc Speed that the buttons fade in/out when disabling/enabling
 * @default 30
 *
 *
 * @help
 * Galv의 화면 버튼
 * ------------------------------------------------- ---------------------------
 *이 플러그인을 사용하면 화면에 클릭 할 수있는 버튼을 만들 수 있습니다.
 * 터치하여 스크립트를 실행하거나 버튼 누름을 에뮬레이트합니다.
 *
 * 기존 버튼을 교체하고자 할 때 사용할 수있는 ID가 부여됩니다.
 * 게임 중에 새로운 버튼이 있습니다.
 *
 * ------------------------------------------------- ---------------------------
 * 스크립트 호출
 * ------------------------------------------------- ---------------------------
 *
 * Galv.SBTNS.addButton (id, 'type', 'img', x, y, [ 'actionType', 'action'], e);
 *
 * id = 버튼의 id. 각 버튼에 고유 번호를 사용하십시오.
 * 'type'= 현재 'map'또는 'mapX'일 수 있으며 x는 맵 ID입니다.
 * 'img'= / img / system /에있는 이미지 이름
 * x = 버튼의 x 위치
 * y = 버튼의 y 위치
 * 'actionType'= 여기에서 다음 유형 중 하나를 선택할 수 있습니다.
 * 버튼을 누르고있는 동안 버튼을 모방하는 '버튼'
 * 'buttonT'는 트리거되는 버튼을 에뮬레이트합니다.
 * 버튼을 눌렀을 때 스크립트 코드를 실행하는 '스크립트'
 * 버튼을 눌렀을 때 공통 이벤트를 실행하는 '이벤트'
 * 'action'= actionType과 관련된 결과 액션
 * '버튼'동작은 키 누름에 사용됩니다. 몇 가지 예 :
 * 'ok', 'cancel', 'shift', 'up', 'down', 'left', 'right'
 * '스크립트'액션은 실행하려는 스크립트 호출입니다.
 * '이벤트'액션은 실행할 공통 이벤트 ID입니다.
 * e = 이벤트 (예 : show)시 버튼 불투명도에 사용되는 숫자
 * 텍스트)가 실행 중입니다. 0-255. 255이면 버튼
 * 계속 표시되며 계속 누를 수 있습니다.
 * 255보다 작 으면 버튼이 비활성화됩니다. 비워 두세요
 * 이벤트 중에 버튼이 자동으로 보이지 않게합니다.
 *
 * 예 :
 * Galv.SBTNS.addButton (1, 'map', 'BtnOk', 570,500, [ 'button', 'ok']);
 * Galv.SBTNS.addButton (2, 'map', 'BtnRun', 690,500, [ 'button', 'shift']);
 * Galv.SBTNS.addButton (3, 'map', 'BtnMenu', 0,0, [ 'script', 'SceneManager.push (Scene_Equip)']);
 * Galv.SBTNS.addButton (4, 'map1', 'BtnEvent', 0,0, [ 'event', 1]);
 *
 *
 * $ gameSystem._hideBtns = 상태; // 숨기려면 상태가 true 또는 false 일 수 있습니다.
 * // 또는 모든 버튼 표시
 * ------------------------------------------------- ---------------------------
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.SBTNS.btnList = PluginManager.parameters('Galv_ScreenButtons')["Precache Buttons"].split(',');
Galv.SBTNS.disableMove = PluginManager.parameters('Galv_ScreenButtons')["Disable Mouse Move"].toLowerCase() == 'true' ? true : false;
Galv.SBTNS.fade = Number(PluginManager.parameters('Galv_ScreenButtons')["Button Fade"]);


Galv.SBTNS.triggered = {};

// to be bound within a scene
Galv.SBTNS.createButton = function(obj) {
	if (!obj) return;
	var index = obj.id;

	if (!Galv.SBTNS.canHasButton(index)) return;
	this.removeChild(this._GButtons[index]);

	this._GButtons[index] = new Sprite_GButton(obj);

	if (obj.action) {
		var type = obj.action[0];
		var data = obj.action[1];
		
		switch (type) {
			case 'button':    // for button press emulation
				var button = data;
				this._GButtons[index].setPressHandler(Galv.SBTNS.btnPress.bind(this,data));
				this._GButtons[index].setClickHandler(Galv.SBTNS.btnRelease.bind(this,data));
				break;
			case 'buttonT':    // for button trigger emulation
				var button = data;
				this._GButtons[index].setPressHandler(Galv.SBTNS.btnTrigger.bind(this,data));
				this._GButtons[index].setClickHandler(Galv.SBTNS.btnRelease.bind(this,data));
				break;
			case 'script':    // for script calls
				var script = data;
				this._GButtons[index].setClickHandler(this.gButtonScript.bind(this,data));
				break;
			case 'event':     // for common event
				this._GButtons[index].setClickHandler(Galv.SBTNS.runGCommentEvent.bind(this,data));
				break;	
		}
	}
	this.addChild(this._GButtons[index]);
};


Galv.SBTNS.onButton = function() {
	var x = TouchInput.x;
	var y = TouchInput.y;
	var btns = SceneManager._scene._GButtons;
	if (!btns) return false;
	var result = false;
	for (var i = 0; i < btns.length; i++) {
		if (btns[i] && x > btns[i].x && x < btns[i].x + btns[i].width && y > btns[i].y && y < btns[i].y + btns[i].height) {
			result = true;
			break;
		};
	}
	return result;
};

Galv.SBTNS.canHasButton = function(i) {
	return $gameSystem._gBtns[i] && $gameSystem._gBtns[i].location == 'map' && ($gameSystem._gBtns[i].mapId == 0 || $gameSystem._gBtns[i].mapId == $gameMap.mapId());
};

Galv.SBTNS.runGCommentEvent = function(id) {
	 $gameTemp.reserveCommonEvent(id);
};

Galv.SBTNS.btnPress = function(btn) {
	Input._currentState[btn] = true;
};

Galv.SBTNS.btnTrigger = function(btn) {
	if (!Galv.SBTNS.triggered[btn]) {
		Input._currentState[btn] = true;
		Galv.SBTNS.triggered[btn] = true;
	} else {
		Input._currentState[btn] = false;
	};
};

Galv.SBTNS.btnRelease = function(btn) {
	Input._currentState[btn] = false;
	Galv.SBTNS.triggered[btn] = false;
};

Galv.SBTNS.addButton = function(id,location,img,x,y,action,e) {
	var obj = {id:id,image:img,x:x,y:y,action:action,eOpacity:e || 0};
	
	var location = location.toLowerCase();
	if (location[0] == 'm') {
		// map
		obj.location = 'map';
		obj.mapId = Number(location.replace('map',''));

		$gameSystem._gBtns[id] = obj;
		SceneManager._scene.createGBtn($gameSystem._gBtns[id]);	
	}
	
};

Galv.SBTNS.removeButton = function(id) {
	$gameSystem._gBtns[id] = null;
	SceneManager._scene.removeGButton(id);
};


//-----------------------------------------------------------------------------
//   PRE CACHE BUTTONS!
//-----------------------------------------------------------------------------

Galv.SBTNS.Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function() {
	Galv.SBTNS.Scene_Boot_loadSystemImages.call(this);
	for (var i = 0; i < Galv.SBTNS.btnList.length; i++) {
		ImageManager.loadSystem(Galv.SBTNS.btnList[i]);
	}
};


//-----------------------------------------------------------------------------
//  GAME SYSTEM
//-----------------------------------------------------------------------------

Galv.SBTNS.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	this._mouseMove = !Galv.SBTNS.disableMove;
	this._hideBtns = false;
	this._gBtns = [];
	Galv.SBTNS.Game_System_initialize.call(this);
};


//-----------------------------------------------------------------------------
//  SCENE BASE
//-----------------------------------------------------------------------------

Galv.SBTNS.Scene_Base_initialize = Scene_Base.prototype.initialize;
Scene_Base.prototype.initialize = function() {
	Input.clear();
	this._GButtons = [];
	Galv.SBTNS.Scene_Base_initialize.call(this);
	this.createGBtn = Galv.SBTNS.createButton.bind(this);
};

Galv.SBTNS.Scene_Base_start = Scene_Base.prototype.start;
Scene_Base.prototype.start = function() {
	Input.clear(); // clear anything held down when starting a new scene!
	Galv.SBTNS.Scene_Base_start.call(this);
};

Scene_Base.prototype.createGButtons = function() {};

Scene_Base.prototype.removeGButton = function(id) {
	this.removeChild(this._GButtons[id]);
};

Scene_Base.prototype.gButtonScript = function(script) {
	eval(script);
};


//-----------------------------------------------------------------------------
//  SCENE MAP
//-----------------------------------------------------------------------------

Galv.SBTNS.Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
	this.createGButtons();
	Galv.SBTNS.triggered = {};
	Galv.SBTNS.Scene_Map_start.call(this);
};

Scene_Map.prototype.createGButtons = function() {
	for (var i = 0; i < $gameSystem._gBtns.length; i++) {
		if (Galv.SBTNS.canHasButton(i)) {
			this.createGBtn($gameSystem._gBtns[i]);
		}
	}
};


//-----------------------------------------------------------------------------
//  GAME TEMP
//-----------------------------------------------------------------------------

Galv.SBTNS.Game_Temp_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
	if (!$gameSystem._mouseMove || Galv.SBTNS.onButton()) return;
    Galv.SBTNS.Game_Temp_setDestination.call(this,x,y);
};


})();


//-----------------------------------------------------------------------------
//  SPRITE GBUTTON
//-----------------------------------------------------------------------------

function Sprite_GButton() {
    this.initialize.apply(this, arguments);
}

Sprite_GButton.prototype = Object.create(Sprite_Button.prototype);
Sprite_GButton.prototype.constructor = Sprite_GButton;

Sprite_GButton.prototype.initialize = function(gameBtn) {
    Sprite_Button.prototype.initialize.call(this);
	this._hidden = false;
	this.setupButton(gameBtn);
};

Sprite_GButton.prototype.setupButton = function(b) {
	this._btn = b;
	this.bitmap = ImageManager.loadSystem(b.image);
	var h = this.bitmap.height / 2;
	var w = this.bitmap.width;
	this.setColdFrame(0, 0, w, h);
	this.setHotFrame(0, h, w, h);
	
	this.x = b.x;
	this.y = b.y;
};

Sprite_GButton.prototype.processTouch = function() {
    if (this.isActive() && this.opacity >= 255) {
        if (TouchInput.isTriggered() && this.isButtonTouched()) {
            this._touching = true;
			this._wasTouching = true;
		}
        if (this._touching) {
            if (TouchInput.isReleased() || !this.isButtonTouched()) {
                if (this._wasTouching) {
					console.log(this._btn);
                    this.callClickHandler();
                }
				this._touching = false;
				this._wasTouching = false;
            } else {
				// while pressed
				this.callPressHandler();
			}
        } else if (this._wasTouching) {
			// for click holding, moving off of button and releasing issue
			this.callClickHandler();
			this._wasTouching = false;
			this._touching = false;
		}
    } else {
        this._touching = false;
		if (this._wasTouching) {
			this.callClickHandler();
			this._wasTouching = false;
		};
    }
};

Sprite_GButton.prototype.setPressHandler = function(method) {
    this._pressHandler = method;
};

Sprite_GButton.prototype.callPressHandler = function() {
    if (this._pressHandler) {
        this._pressHandler();
    }
};

Sprite_GButton.prototype.update = function() {
	Sprite_Button.prototype.update.call(this);
	this.updateVisibility();
};

Sprite_GButton.prototype.updateVisibility = function() {
	if ($gameSystem._hideBtns) {
		this.opacity -= Galv.SBTNS.fade;
	} else if ($gameMap.isEventRunning()) {
		this.opacity = Math.max(this.opacity - Galv.SBTNS.fade,this._btn.eOpacity);
	} else {
		this.opacity += Galv.SBTNS.fade;
	}
};