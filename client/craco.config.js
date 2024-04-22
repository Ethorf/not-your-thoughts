const path = require(`path`)

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Locate the rule handling SCSS files
      const oneOfRule = webpackConfig.module.rules.find((rule) => Array.isArray(rule.oneOf))

      if (oneOfRule) {
        // Add sass-loader to handle SCSS files
        const sassLoader = {
          test: /\.scss$/,
          use: [
            'style-loader', // or MiniCssExtractPlugin.loader for production
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src/styles')], // Path to your SCSS files
                },
              },
            },
          ],
        }

        oneOfRule.oneOf.unshift(sassLoader) // Add SCSS loader as the first item
      }

      // Add aliases to resolve paths
      const resolveAlias = webpackConfig.resolve.alias || {}
      webpackConfig.resolve.alias = {
        ...resolveAlias,
        '@styles': path.resolve(__dirname, 'src/styles'), // Example alias for styles
        // Add more aliases as needed
      }

      return webpackConfig
    },
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@redux': path.resolve(__dirname, 'src/redux'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}
