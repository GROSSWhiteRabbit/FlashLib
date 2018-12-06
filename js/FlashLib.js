/**
 * Created by v.postnikov on 23.12.2016.
 */
//var FlashLibJS = {
var fljs = {

    libraries: [],

    /**
     * Добавить библиотеку
     * @param {string} $library объект данные библиотеки
     */
    addNewLibrary: function ($library) {
        this.libraries.push($library)
    },

    /**
     * Создать элемент из библиотеки по имени
     * @param {string} $itemName имя элемента
     * @param {string} $libraryName имя библиотеки
     * @returns {*}
     */
    createItemFromLibrary: function ($itemName, $libraryName) {
        var itemData = this.getItemDataFromLibrary($itemName, $libraryName);
        if (!itemData) {
            throw new Error('В библиотеке не найден элемент ' + $itemName);
        }
        var libraryItem = this.createItemFromLibraryData(itemData);
        return libraryItem
    },

    /**
     * Получить данные для объекта из библиотеки
     * @param {string} $itemName имя элемента
     * @param {string} $libraryName имя библиотеки
     */
    getItemDataFromLibrary: function ($itemName, $libraryName) {
        var splitedName = $itemName.split('\/');
        var lib = this.libraries[0].lib;
        var itemData = getItemDataFromName(lib, splitedName);
        return itemData;

        function getItemDataFromName($parent, $splitedName) {
            var currName = $splitedName.shift();
            $parent = $parent[currName];
            if ($splitedName.length > 0) {
                $parent = getItemDataFromName($parent, $splitedName);
            }
            return $parent
        }
    },

    /**
     * Получить элемент из библиотеки
     * @param $libraryItemData данные элемента библиотеки
     */
    createItemFromLibraryData: function ($libraryItemData) {
        var item = null
        var type = $libraryItemData.linkageExportForAS ?
            $libraryItemData.linkageClassName :
            $libraryItemData.itemType;

        switch (type) {
            case 'movie clip':
                item = new FlashLib.MovieClip($libraryItemData);
                break
            case 'bitmap':
                //var name = $libraryItemData.name;
                //name = name.replace(/(.png|.jpg)/, '');
                //item = PIXI.Sprite.fromFrame(name);

                //console.log('Sprite from frame:', name);
                //item = PIXI.Sprite.fromImage(name);

                item = new FlashLib.Bitmap($libraryItemData);

                break
            default:
                var classObject = getClassByName(type);
                if ($libraryItemData.symbolType === 'movie clip') {
                    item = new classObject($libraryItemData);
                } else {
                    item = new classObject();
                }

        }

        /**
         * Получить объект класса по имени, включая полный путь к нему
         * @param $name
         */
        function getClassByName($name) {
            var splittedName = $name.split('.');

            function getClass($splittedName, $parentItem) {
                if ($splittedName.length === 0) {
                    return $parentItem;
                }

                var name = $splittedName.shift();
                var item = $parentItem[name];
                return getClass($splittedName, item);
            }

            return getClass(splittedName, window);
        }

        return item;
    },

    /**
     * Создать графический жлемент (не из библиотеки)
     * @param $displayItemData данне графического элемента
     * @returns {*}
     */
    createDisplayItemFromData: function ($displayItemData) {
        var item = null;
        switch ($displayItemData.elementType) {
            case 'instance':
                item = this.createItemFromLibrary($displayItemData.libraryItem);
                break;
            case 'text':
                item = new FlashLib.TextField($displayItemData);
                break;
            case 'shape':
                item = new FlashLib.Shape($displayItemData);
                break;
        }

        this.setDisplayItemProperties(item, $displayItemData);
        this.addFiltersToDisplayItem(item, $displayItemData.filters);

        if (item['constructionComplete']) {
            item.constructionComplete();
        }
        return item;
    },

    /**
     * Назначение параметров элементу
     * @param $item объкет которому назначаются параметры
     * @param $displayItemData объект с параметрами которые нужно назначить
     */
    setDisplayItemProperties: function ($item, $displayItemData) {
        $item.name = $displayItemData.name;
        $item.x = $displayItemData.x;
        $item.y = $displayItemData.y;
        $item.width = $displayItemData.width;
        $item.height = $displayItemData.height;
        $item.scale.x = $displayItemData.scaleX;
        $item.scale.y = $displayItemData.scaleY;
        $item.rotation = ($displayItemData.rotation * (Math.PI / 180));
        $item.visible = $displayItemData.visible;
    },

    /**
     * Добавление фильтров
     * @param $item элемент которому добавляются фильтры
     * @param $filters массив с фильтрами
     */
    addFiltersToDisplayItem: function ($item, $filters) {
        if (!$filters) {
            return;
        }

        var newFilters = [];
        $filters.forEach(function (filterData) {
            if (filterData.enabled) {
                switch (filterData.name) {
                    case 'glowFilter':
                        console.log(filterData);
                        break;
                    case 'dropShadowFilter':
                        console.log(filterData);
                        break;
                    case 'bevelFilter':
                        console.log(filterData);
                        break;
                    case 'blurFilter':
                        var qualityList = {'low': 90, 'medium': 65, 'high': 40};
                        var filter = new PIXI.filters.BlurFilter(filterData.strength, qualityList[filterData.quality]);
                        filter.blurX = filterData.blurX;
                        filter.blurY = filterData.blurY;
                        newFilters.push(filter);
                        break;
                }
            }
        }, this);
        $item.filters = newFilters;
    },

    Shape: (function () {
        /**
         *
         * @param $data
         * @constructor
         */
        function Shape($data) {
            PIXI.Graphics.call(this);

            this.libData = $data;

            this.createGraphic()
        }

        Shape.prototype = Object.create(PIXI.Graphics.prototype);
        Shape.prototype.constructor = Shape;

        Shape.prototype.createGraphic = function () {

        };

        return Shape
    })(),

    Bitmap: (function () {
        /**
         *
         * @param $data
         * @constructor
         */
        function Bitmap($data) {
            var name = $data.name.replace(/(.png|.jpg)/, '');
            var texture = PIXI.utils.TextureCache[name];

            PIXI.Sprite.call(this, texture);

            this.libData = $data;
        }

        Bitmap.prototype = Object.create(PIXI.Sprite.prototype);
        Bitmap.prototype.constructor = Bitmap;

        return Bitmap;
    })(),

    MovieClip: (function () {
        /**
         * Класс мувиклипа с кадрами
         * @param $data данные мувиклипа
         * @constructor
         */
        function MovieClip($data) {
            PIXI.Container.call(this);

            this.libData = $data;
            this.timelineData = this.libData.timeline;
            this.currentFrameIndex = -1;
            this.currentFrameName = '';
            this.animateParams = null;

            this.startFrameTime = null;

            this.isPlaying = false;
            this.goToFrame(1);
        }

        MovieClip.prototype = Object.create(PIXI.Container.prototype);
        MovieClip.prototype.constructor = MovieClip;

        /**
         * Завершено создание элемента и назначение изначальных параметров
         */
        MovieClip.prototype.constructionComplete = function () {

        };

        /**
         * Вызывается при смене кадра перед очисткой кадра и созданием новых элементов
         */
        MovieClip.prototype.exitFrame = function () {

        };

        /**
         * Получить детей по имени в библиотеке
         * Паботает только с элементами этого расширения
         * @param $name имя элемента из библиотеки
         * @returns {array} массив объектов имя в бибилиотеке совпадает с заданым
         */
        MovieClip.prototype.getChildrenByLibName = function ($name) {
            return this.children.filter(function (child) {
                return (child.hasOwnProperty('libData') && child.libData.hasOwnProperty('name') && child.libData.name === $name);
            })
        };

        /**
         * Переход к следующему кадру клипа
         * @param $loop если дошли до последнего кадра переходить ли на первыц
         */
        MovieClip.prototype.goToNextFrame = function ($loop) {
            var nextIndex = this.currentFrameIndex + 1;
            if (nextIndex > this.timelineData.frames.length) {
                nextIndex = $loop ? 1 : this.currentFrameIndex;

                if (this.isPlaying && !$loop) {
                    this.stop();
                }
            }
            this.goToFrame(nextIndex);
        };

        /**
         * Перейти к предыдущему кадру
         * @param $loop если дошли до первого кадра переходить ли на последний
         */
        MovieClip.prototype.goToPreviousFrame = function ($loop) {
            var nextIndex = this.currentFrameIndex - 1;
            if (nextIndex < 1) {
                nextIndex = $loop ? this.timelineData.frames.length : 1;

                if (this.isPlaying && !$loop) {
                    this.stop();
                }
            }
            this.goToFrame(nextIndex);
        };

        /**
         * Перейти на конкретный кадр
         * @param $frameId номер или имя кадра на который нужно перейти
         * @param $force перерисовать кадр даже если текущий кадр такой же
         */
        MovieClip.prototype.goToFrame = function ($frameId, $force) {
            if ($frameId === this.currentFrameIndex && (!$force && $force !== 0)) {
                //console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' now on frame ' + $frameId);
                return;
            }
            if ($frameId > this.timelineData.frames.length || $frameId < 1) {
                console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' does not have a frame ' + $frameId);
                return;
            }
            this.exitFrame();
            this.removeChildren();
            this.constructFrame($frameId);
        };

        /**
         *
         * @param $delta
         */
        MovieClip.prototype.animate = function ($delta) {
            var frameDuration = 1000 / this.animateParams.fps;
            var currentTime = Date.now();
            var deltaTime = currentTime - this.startFrameTime;
            if (deltaTime < frameDuration) {
                return;
            }
            var skipFramesCount = Math.ceil(deltaTime / frameDuration);
            var revers = this.animateParams.revers;
            var loop = this.animateParams.loop;
            for (var i = 0; i < skipFramesCount; i++) {
                if (revers) {
                    this.goToPreviousFrame(loop);
                } else {
                    this.goToNextFrame(loop);
                }
            }
            this.startFrameTime = currentTime - (deltaTime % frameDuration);
        };

        /**
         *
         * @param $loop зациклена ли анимация
         * @param $revers проигрывание в обратную сторону
         * @param $fps какой частотой обновления кадров нужно проиграть
         */
        MovieClip.prototype.play = function ($loop, $revers, $fps) {
            if (this.isPlaying) {
                return;
            }

            this.animateParams = {loop: $loop, revers: $revers, fps: $fps || 24}
            this.startFrameTime = Date.now();
            PIXI.ticker.shared.add(this.animate, this, PIXI.UPDATE_PRIORITY.HIGH);
            this.isPlaying = true;
        };

        /**
         * Перейти на кадр и запустить проигрывание мувиклипа
         * @param $frameId с какого кадра начать проигрывание
         * @param $loop зациклена ли анимация
         * @param $revers проигрывание в обратную сторону
         * @param $fps с какой частотой обновления кадров нужно проиграть
         */
        MovieClip.prototype.goToAndPlay = function ($frameId, $loop, $revers, $fps) {
            this.stop();
            this.goToFrame($frameId);
            this.play($loop, $revers, $fps);
        };

        /**
         * Остановить проишрывание мувиклипа
         */
        MovieClip.prototype.stop = function () {
            if (!this.isPlaying) {
                return;
            }

            this.animateParams = null;
            PIXI.ticker.shared.remove(this.animate, this);
            this.isPlaying = false;
        };

        /**
         * Создать элемениы кадра
         * @param $frameId номер кадра который нужно создать
         */
        MovieClip.prototype.constructFrame = function ($frameId) {
            //var currentFrameData = null;
            //var displayItemData = null;
            var displayItem = null;

            this.timelineData.frames[$frameId - 1].forEach(function (currentFrameData) {
                currentFrameData.elements.forEach(function (displayItemData) {
                    displayItem = FlashLib.createDisplayItemFromData(displayItemData);
                    this.addChild(displayItem);
                }.bind(this))
                this.currentFrameName = currentFrameData.name;
                this.evalScript(currentFrameData.actionScript);
            }.bind(this));

            /*for (var i = 0; i < this.timelineData.frames[$frameId - 1].length; i++) {
                currentFrameData = this.timelineData.frames[$frameId - 1][i];
                for (var j = 0; j < currentFrameData.elements.length; j++) {
                    displayItemData = currentFrameData.elements[j];
                    displayItem = FlashLibJS.createDisplayItemFromData(displayItemData);
                    this.addChild(displayItem);
                }
            }*/
            //this.currentFrameName = currentFrameData.name;
            this.currentFrameIndex = $frameId;
        };

        MovieClip.prototype.evalScript = function ($script) {
            if ($script && $script !== '') {
                eval($script);
            }
        };

        return MovieClip;
    })(),

    TextField: (function () {
        /**
         *
         * @param $data
         * @constructor
         */
        function TextField($data) {
            this.textRect = null;
            this.libData = $data;

            this.createRect();

            var textRun = $data.textRuns[0];
            var textAttrs = textRun.textAttrs;
            var style = {
                align: textAttrs.alignment,
                fill: textAttrs.fillColor,
                fontFamily: textAttrs.face.split(' '),
                fontSize: textAttrs.size,
                fontStyle: textAttrs.italic ? 'italic' : 'normal',
                fontWeight: textAttrs.bold ? 'bold' : 'normal',
                letterSpacing: textAttrs.letterSpacing
                // stroke: '#000000',
                // strokeThickness: 3

            };
            PIXI.Text.call(this, textRun.characters, style);
        }

        TextField.prototype = Object.create(PIXI.Text.prototype);
        TextField.prototype.constructor = TextField;

        Object.defineProperties(TextField.prototype, {
            x: {
                get: function () {
                    return this.textRect.x;
                },
                set: function (value) {
                    this.textRect.x = value - this.style.strokeThickness * 2;
                    this.correctPosition();
                }
            },
            y: {
                get: function () {
                    return this.textRect.y
                },
                set: function (value) {
                    this.textRect.y = value - this.style.strokeThickness * 2;
                    this.correctPosition();
                }
            },
            origWidth: {
                get: function () {
                    this.updateText(true);

                    return Math.abs(this.scale.x) * this.texture.orig.width;
                },
                set: function (value) {
                    this.updateText(true)

                    var sign = PIXI.utils.sign(this.scale.x) || 1;
                    this.scale.x = sign * value / this.texture.orig.width;
                    this._width = value;
                }
            },
            origHeight: {
                get: function () {
                    this.updateText(true);

                    return Math.abs(this.scale.y) * this._texture.orig.height;
                },
                set: function (value) {
                    this.updateText(true);

                    var sign = PIXI.utils.sign(this.scale.y) || 1;
                    this.scale.y = sign * value / this.texture.orig.height;
                    this._height = value;
                }
            },
            text: {
                get: function () {
                    return this._text;
                },
                set: function (text) {

                    text = text || ' ';
                    text = text.toString();

                    if (this._text === text) {
                        return;
                    }
                    this._text = text;
                    this.dirty = true;
                    this.correctPosition();
                }
            },
            width: {
                get: function () {
                    return this.textRect.width;
                },
                set: function (value) {
                    this.textRect.width = value;
                    this.correctPosition();
                }
            },
            height: {
                get: function () {
                    return this.textRect.height;
                },
                set: function (value) {
                    this.textRect.height = value;
                    this.correctPosition();
                }
            }
        });

        TextField.prototype.createRect = function () {
            this.textRect = new PIXI.Rectangle(0, 0, 0, 0);
        };

        TextField.prototype.correctPosition = function () {
            if (this.style && this.style.align) {
                switch (this.style.align) {
                    case 'left':
                        this.transform.position.x = this.textRect.x;
                        break;
                    case 'center':
                        this.transform.position.x = this.x + ((this.textRect.width - this.origWidth) / 2);
                        break;
                    case 'right':
                        this.transform.position.x = this.x + (this.textRect.width - this.origWidth);
                        break;
                    default:
                        this.transform.position.x = this.textRect.x;
                        break;
                }
            } else {
                this.transform.position.x = this.textRect.x;
            }
            this.transform.position.y = this.textRect.y;
        };

        return TextField;
    })()
};

(function (f) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = f()
    } else if (typeof define === 'function' && define.amd) {
        define([], f)
    } else {
        var g = null;
        if (typeof window !== 'undefined') {
            g = window;
        } else if (typeof global !== 'undefined') {
            g = global;
        } else if (typeof self !== 'undefined') {
            g = self;
        } else {
            g = this;
        }
        g.FlashLib = f();
    }
})(function () {
    function isJson(resource) {
        return resource.type === PIXI.loaders.Resource.TYPE.JSON;
    }

    function atlasParser() {
        return function (resource, next) {
            if (!resource.data || !isJson(resource) || !resource.data.metaData ||
                !resource.data.metaData.type || resource.data.metaData.type !== 'FlashLib') {
                return next();
            }

            //PIXI.loader.reset();
            var options = {
                crossOrigin: resource.crossOrigin,
                xhrType: PIXI.loaders.Resource.TYPE.JSON,
                metadata: null,
                parentResource: resource
            };
            resource.data.libs.forEach(function ($lib) {
                PIXI.loader.add($lib.name, $lib.path, options);
            }, this);
            resource.data.assets.forEach(function ($item) {
                PIXI.loader.add($item.name, $item.path, options);
            }, this);

            return next();
        }
    }

    PIXI.loaders.Loader.addPixiMiddleware(atlasParser);
    PIXI.loader.use(atlasParser());

    return fljs
});