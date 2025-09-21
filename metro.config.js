const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are properly handled
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs'];

module.exports = config;

