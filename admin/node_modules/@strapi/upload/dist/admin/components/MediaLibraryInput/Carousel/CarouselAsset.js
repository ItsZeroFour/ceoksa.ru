'use strict';

var jsxRuntime = require('react/jsx-runtime');
var designSystem = require('@strapi/design-system');
var styledComponents = require('styled-components');
var enums = require('../../../enums.js');
var createAssetUrl = require('../../../utils/createAssetUrl.js');
require('byte-size');
require('date-fns');
require('qs');
require('../../../utils/typeFromMime.js');
require('../../../utils/urlYupSchema.js');
var icons = require('../../../utils/icons.js');
var AudioPreview = require('../../AssetCard/AudioPreview.js');
var VideoPreview = require('../../AssetCard/VideoPreview.js');

const DocAsset = styledComponents.styled(designSystem.Flex)`
  background: linear-gradient(180deg, #ffffff 0%, #f6f6f9 121.48%);
`;
const VideoPreviewWrapper = styledComponents.styled(designSystem.Box)`
  canvas,
  video {
    max-width: 100%;
    height: 124px;
  }
`;
const AudioPreviewWrapper = styledComponents.styled(designSystem.Box)`
  canvas,
  audio {
    max-width: 100%;
  }
`;
const CarouselAsset = ({ asset })=>{
    if (asset.mime?.includes(enums.AssetType.Video)) {
        return /*#__PURE__*/ jsxRuntime.jsx(VideoPreviewWrapper, {
            height: "100%",
            children: /*#__PURE__*/ jsxRuntime.jsx(VideoPreview.VideoPreview, {
                url: createAssetUrl.createAssetUrl(asset, true),
                mime: asset.mime,
                alt: asset.alternativeText || asset.name
            })
        });
    }
    if (asset.mime?.includes(enums.AssetType.Audio)) {
        return /*#__PURE__*/ jsxRuntime.jsx(AudioPreviewWrapper, {
            children: /*#__PURE__*/ jsxRuntime.jsx(AudioPreview.AudioPreview, {
                url: createAssetUrl.createAssetUrl(asset, true),
                alt: asset.alternativeText || asset.name
            })
        });
    }
    if (asset.mime?.includes(enums.AssetType.Image)) {
        const assetUrl = createAssetUrl.createAssetUrl(asset, true);
        if (!assetUrl) return null;
        // Adding a param to the url to bust the cache and force the refresh of the image when replaced
        // Only add updatedAt parameter if the URL is not signed to prevent signature invalidation
        const cacheBustedUrl = asset.isUrlSigned ? assetUrl : `${assetUrl}${assetUrl.includes('?') ? '&' : '?'}updatedAt=${asset.updatedAt}`;
        return /*#__PURE__*/ jsxRuntime.jsx(designSystem.Box, {
            tag: "img",
            maxHeight: "100%",
            maxWidth: "100%",
            src: cacheBustedUrl,
            alt: asset.alternativeText || asset.name
        });
    }
    const IconComponent = icons.getFileIconComponent(asset.ext);
    return /*#__PURE__*/ jsxRuntime.jsx(DocAsset, {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        hasRadius: true,
        children: /*#__PURE__*/ jsxRuntime.jsx(IconComponent, {
            "aria-label": asset.alternativeText || asset.name,
            width: "24px",
            height: "32px"
        })
    });
};

exports.CarouselAsset = CarouselAsset;
//# sourceMappingURL=CarouselAsset.js.map
