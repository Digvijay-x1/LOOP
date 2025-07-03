const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Apply the NativeWind transformer with proper input file path
module.exports = withNativeWind(config, { input: './global.css' });