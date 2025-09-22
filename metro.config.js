const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are properly handled
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs'];

// Web-specific configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper web bundling
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;

