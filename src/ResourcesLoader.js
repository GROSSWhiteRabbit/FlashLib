import { Assets } from 'pixi.js'
import {ExtensionType, utils} from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';

import FlashLib from "./FlashLib";

export default {
    extension: {
        name: "FlashlibResourcesLoader",
        priority: LoaderParserPriority.Normal,
        type: ExtensionType.LoadParser,
    },
    _eMetaDataTypes: {
        FLASHLIB_ASSETS: 'FlashLibAssets',
        FLASHLIB: 'FlashLib',
    },
    testParse(asset, options, Loader) {
        return !!asset && !!options && options.format === "json" && asset.metaData && asset.metaData.type && Object.values(this._eMetaDataTypes).includes(asset.metaData.type);
    },
    async parse(asset, options, Loader) {
        const basePath = utils.path.dirname(options.src);
        switch (asset.metaData.type) {
            case this._eMetaDataTypes.FLASHLIB_ASSETS:
                if (asset.libs && asset.libs.length > 0) {
                    for (const $lib of asset.libs) {
                        if ($lib.path) {
                            const url = basePath + '/' + asset.baseUrl + $lib.path;
                            await _loadAndSetAsset($lib.name, url, Loader)
                        }
                        if ($lib.data) {
                            FlashLib.addNewLibrary($lib.data);
                        }
                    }
                }
                if (asset.assets && asset.assets.length > 0) {
                    for (const $item of asset.assets) {
                        if ($item.path) {
                            const url = basePath + '/' + asset.baseUrl + $item.path;
                            await _loadAndSetAsset($item.name, url, Loader)
                        }
                        if ($item.data) {
                            assets[$item.name] = $item.data
                        }
                    }
                }
                break;
            case this._eMetaDataTypes.FLASHLIB:
                FlashLib.addNewLibrary(asset);
                break;
            default:
                throw new Error('Invalid resource type for Flashlib ResourcesLoader parser');
                break;
        }
        return asset;
    }
}


const _loadAndSetAsset = async (key, url, Loader) => {
    const asset = await Loader.load(url);
    if (asset?.constructor?.name === '_Spritesheet') return;
    Assets.cache.set(key, asset);
}
