const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite web worker imports wa-sqlite.wasm; Metro must treat it as an asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
