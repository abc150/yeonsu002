//-----------------------------------------------------------------------------
//  Galv's Visual Novel Choices
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_VisualNovelChoices.js
//-----------------------------------------------------------------------------
//  2016-10-06 - Version 1.6 - hopefully fixed cache issue with MV update 1.5
//  2016-08-10 - Version 1.5 - fixed cache issue with MV update 1.3
//  2016-05-12 - Version 1.4 - vnbuttons img added to 'dont exclude' file list
//  2016-04-02 - Version 1.3 - change for compatibility with menu cursors
//  2016-03-21 - Version 1.2 - fixed color codes and compatibility with HIME's
//                           - choice plugins
//  2016-03-16 - Version 1.1 - added setting to make a gap between choices and
//                           - message box, added button setting for disabled
//                           - choices
//  2016-03-14 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_VisualNovelChoices = true;

var Galv = Galv || {};            // Galv's main object
Galv.VNC = Galv.VNC || {};        // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.6) Changes how the "Choice" message boxes display to appear more like visual novels.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Command Width
 * @desc 선택 명령의 폭. 이는 VNButtons.png 너비와 같거나 작아야합니다.
 * @default 700
 *
 * @param Command Height
 * @desc 선택 명령의 폭
 * @default 48
 *
 * @param Always Middle
 * @desc "선택 항목 표시"창 위치에 관계없이 중간에 선택 항목을 표시합니다. true or false
 * @default true
 *
 * @param Message Gap
 * @desc 메시지 창에서 선택 항목이 표시되는 거리
 * @default 0
 *
 * @param Disabled Button
 * @desc 비활성화 된 선택에 대한 버튼을 표시하는 데 사용되는 행 번호 (선택 사항을 비활성화 할 수있는 플러그인을 사용하는 경우)
 * @default 3
 *
 * @requiredAssets img/system/VNButtons
 *
 * @help
 * Galv의 비주얼 노벨 선택
 * ------------------------------------------------- ---------------------------
 * 더 시각적 인 소설 스타일로 선택을 표시합니다. 선택을위한 이미지
 * 버튼은 / img / system / 폴더에 넣어야하며 이름은 다음과 같아야합니다.
 * "VNButtons.png". 상단에 각 버튼이 하나씩 포함 된 단일 파일입니다.
 * 다른 것.
 * 명령 너비 및 명령 높이 설정은
 * 버튼은 Command Gap이 버튼 사이의 공간을 제어합니다. 확인하십시오
 * "명령 너비"플러그인 설정은 그래픽의 픽셀 너비와 동일합니다.
 *
 * VNButtons 파일의 첫 번째 버튼 이미지는 버튼 0입니다.
 * 버튼 위에 표시되는 커서 이미지. 다음 경우에 사용되는 기본 버튼
 * 선택 옵션 텍스트에 지정되지 않은 것은 버튼 1 (아래
 * 커서 이미지).
 *
 * 선택 옵션 텍스트에 \ b [x]를 사용하면 다른 버튼을 지정할 수 있습니다.
 * 그래픽 선택 (x는 행 번호 임) 및 버튼.
 *
 * 플러그인 설정의 "사용 안함 버튼"옵션은
 * 다음과 같은 선택 명령을 비활성화하는 다른 플러그인 :
 * "Disabled Choice Conditions"by Hime.
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT CALL:
 * ----------------------------------------------------------------------------
 *
 *        $gameSystem.vnChoices = status;      // status can be true or false
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {


Galv.VNC.width = Number(PluginManager.parameters('Galv_VisualNovelChoices')["Command Width"]);
Galv.VNC.height = Number(PluginManager.parameters('Galv_VisualNovelChoices')["Command Height"]);
Galv.VNC.alwaysMid = PluginManager.parameters('Galv_VisualNovelChoices')["Always Middle"].toLowerCase() == 'true' ? true : false;
Galv.VNC.msgGap = Number(PluginManager.parameters('Galv_VisualNovelChoices')["Message Gap"]);
Galv.VNC.disableBtn = Number(PluginManager.parameters('Galv_VisualNovelChoices')["Disabled Button"]);

// Cache
Galv.VNC.Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = function() {
    ImageManager.reserveSystem('VNButtons');
	Galv.VNC.Scene_Boot_loadSystemImages.call(this);
};


// Choice stuff
Galv.VNC.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	Galv.VNC.Game_System_initialize.call(this);
	this.vnChoices = true;
};

// Overwrite
Window_ChoiceList.prototype.textHeight = Window_ChoiceList.prototype.lineHeight;
Galv.VNC.Window_ChoiceList_lineHeight = Window_ChoiceList.prototype.lineHeight;
Window_ChoiceList.prototype.lineHeight = function() {return $gameSystem.vnChoices ? Galv.VNC.height : Galv.VNC.Window_ChoiceList_lineHeight.call(this);};
Galv.VNC.Window_ChoiceList_itemHeight = Window_ChoiceList.prototype.itemHeight;
Window_ChoiceList.prototype.itemHeight = function() {return $gameSystem.vnChoices ? Galv.VNC.height : Galv.VNC.Window_ChoiceList_itemHeight.call(this);};

Galv.VNC.Window_ChoiceList_drawItem = Window_ChoiceList.prototype.drawItem;
Window_ChoiceList.prototype.drawItem = function(index) {
	if ($gameSystem.vnChoices) {
		var rect = this.itemRectForText(index);
		this.drawButton(index,rect.y);
		if (index === this._index) this.drawButton(index,rect.y,true);
		var offset = (this.lineHeight() - this.textHeight()) * 0.5;
		this.drawTextEx(this.commandName(index), rect.x, rect.y + offset);
	} else {
		Galv.VNC.Window_ChoiceList_drawItem.call(this,index);
	};
};

Galv.VNC.Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
Window_ChoiceList.prototype.updatePlacement = function() {
	Galv.VNC.Window_ChoiceList_updatePlacement.call(this);
	if ($gameSystem.vnChoices && Galv.VNC.alwaysMid) {
		this.x = (Graphics.boxWidth - this.width) / 2;
	};
	if (this._messageWindow.y >= Graphics.boxHeight / 2) {
		this.y -= Galv.VNC.msgGap;
    } else {
        this.y += Galv.VNC.msgGap;
    };
};

Galv.VNC.Window_ChoiceList__refreshCursor = Window_ChoiceList.prototype._refreshCursor;
Window_ChoiceList.prototype._refreshCursor = function() {
	if ($gameSystem.vnChoices) {
		this._windowCursorSprite.opacity = 0;
	} else {
		Galv.VNC.Window_ChoiceList__refreshCursor.call(this);
	};
};

Window_ChoiceList.prototype.drawButton = function(index,y,cursor) {
    var bitmap = ImageManager.loadSystem('VNButtons');
    var pw = Galv.VNC.width;
    var ph = Galv.VNC.height;

    var sx = 0;
	if (cursor) {
		var bgId = 0;
	} else {
		if (this._list[index].enabled === false) {
			var bgId = Galv.VNC.disableBtn;
		} else {
			var bgId = this.choice_background[index] ? this.choice_background[index] : 1;
		};
	};
    var sy = bgId * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, 0, y);
};

Galv.VNC.Window_ChoiceList_start = Window_ChoiceList.prototype.start;
Window_ChoiceList.prototype.start = function() {
	this.setupVNChoices();
	Galv.VNC.Window_ChoiceList_start.call(this);
};

Window_ChoiceList.prototype.setupVNChoices = function() {
	this.ChoiceSprites = [];
	this.choice_background = [];
	this._vnIndex = this._index;
    if ($gameSystem.vnChoices) {
      this.opacity = 0;
	} else {
      this.opacity = 255;
	};
};

Galv.VNC.Window_ChoiceList_update = Window_ChoiceList.prototype.update;
Window_ChoiceList.prototype.update = function() {
	Galv.VNC.Window_ChoiceList_update.call(this);
	if (this._vnIndex != this._index) {
		this.refresh();
		this._vnIndex = this._index;
	}
};


Galv.VNC.Window_ChoiceList_updateBackground = Window_ChoiceList.prototype.updateBackground;
Window_ChoiceList.prototype.updateBackground = function() {
	if ($gameSystem.vnChoices) {
		this._background = 2;
   	 	this.setBackgroundType(this._background);
	} else {
		Galv.VNC.Window_ChoiceList_updateBackground.call(this);
	};
    
};


Galv.VNC.Window_ChoiceList_convertEscapeCharacters = Window_ChoiceList.prototype.convertEscapeCharacters;
Window_ChoiceList.prototype.convertEscapeCharacters = function(text,index) {
	text = text.replace(/\\/g, '\x1b');
	text = text.replace(/\x1b\x1b/g, '\\');
	text = text.replace(/\x1bB\[(\d+)\]/gi, function() {
		this.choice_background[index] = parseInt(arguments[1]);
        return "";
    }.bind(this));
	
	return Galv.VNC.Window_ChoiceList_convertEscapeCharacters.call(this,text);
};

Window_ChoiceList.prototype.itemRectForText = function(index) {
    var rect = this.itemRect(index);
	if ($gameSystem.vnChoices) {

		var txt = $gameMessage._choices[index];
		
		// count icon code
		var icons = txt.match(/\\i\[/g) || txt.match(/\\I\[/g);
		icons = icons ? icons.length * 36 : 0;
		
		txt = this.convertEscapeCharacters(txt,index);
		txt = txt.replace(/i\[\d*\]/g,"");
		txt = txt.replace(/I\[\d*\]/g,"");
		
		txt = txt.replace(/c\[\d*\]/g,"");
		txt = txt.replace(/C\[\d*\]/g,"");
		var txtSize = this.textWidth(txt) + icons;

		rect.x = (Galv.VNC.width - txtSize) / 2;
	} else {
		rect.x += this.textPadding();
	};
	rect.width -= this.textPadding() * 2;
	return rect;
};

Window_ChoiceList.prototype.windowWidth = function() {
    var width = this.maxChoiceWidth() + this.padding * 2;
    return Math.min(width, Graphics.boxWidth);
};

Galv.VNC.Window_ChoiceList_maxChoiceWidth = Window_ChoiceList.prototype.maxChoiceWidth;
Window_ChoiceList.prototype.maxChoiceWidth = function() {
	if ($gameSystem.vnChoices) {
		return Galv.VNC.width;
	} else {
		return Galv.VNC.Window_ChoiceList_maxChoiceWidth.call(this);
	};
};


})();