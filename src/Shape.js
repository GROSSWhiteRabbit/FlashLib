import {Graphics, utils, Matrix, Color} from 'pixi.js'
import DisplayProperties from "./DisplayProperties";

export default class Shape extends Graphics {

    constructor($data) {
        super();

        this.displayData = $data;
        this.createGraphic();

        DisplayProperties.setDisplayItemProperties(this, this.displayData);
    }

    createGraphic() {
        this.displayData.contours.forEach((contourData) => {
            if (contourData.interior) {
                switch (contourData.fill.style) {
                    case 'bitmap':
                        let texture = utils.TextureCache[contourData.fill.bitmapPath.replace(/(\.png|\.jpg)/, '')];
                        let matrix = new Matrix(
                            contourData.fill.matrix.a / 20,
                            contourData.fill.matrix.b * (Math.PI / 180),
                            contourData.fill.matrix.c * (Math.PI / 180),
                            contourData.fill.matrix.d / 20,
                            -this.displayData.width / 2 + contourData.fill.matrix.tx - this.displayData.left,
                            -this.displayData.height / 2 + contourData.fill.matrix.ty - this.displayData.top
                        );
                        let params = {
                            texture: texture,
                            matrix: matrix
                        };
                        this.beginTextureFill(params);
                        break;
                    case 'solid':
                        const color = Color.shared.setValue(contourData.fill.color);
                        const alpha = color.alpha;
                        color.setAlpha(alpha);
                        this.beginFill(color);
                        break;
                    case 'linearGradient':

                        break;
                    case 'radialGradient':

                        break;
                    default:

                        break;
                }
            }
        })
        if (this.displayData.isRectangleObject) {
            this.drawRect(-this.displayData.width / 2, -this.displayData.height / 2, this.displayData.width, this.displayData.height);
        } else if (this.displayData.isOvalObject) {
            this.drawEllipse(0, 0, this.displayData.width / 2, this.displayData.height / 2);
        } else {
            this.drawPolygon(this.getPolygon());
        }
        this.endFill();
    }

    getPolygon() {
        let polygon = [];
        this.displayData.vertices.forEach((verticeData) => {
            polygon.push(verticeData.x - this.displayData.x, verticeData.y - this.displayData.y);
        });
        return polygon;
    }

    get useTransformPoint() {
        return this._useTransformPoint || false;
    }

    set useTransformPoint(value) {
        if (this._useTransformPoint === value) {
            return;
        }

        this._useTransformPoint = value;

        if (this._useTransformPoint) {
            this.pivot.set(this.tpX, this.tpY);
            this.x += this.tpX;
            this.y += this.tpY;
        } else {
            this.pivot.set(0, 0);
            this.x -= this.tpX;
            this.y -= this.tpY;
        }
    }
}
