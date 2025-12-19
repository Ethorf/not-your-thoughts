const path = require(`path`)

module.exports = {
  devServer: {
    allowedHosts: 'all', // Allow all hosts (including ngrok)
  },
  webpack: {
    configure: (webpackConfig, { env }) => {
      const isDevelopment = env === 'development'

      // Locate the rule handling SCSS files
      const oneOfRule = webpackConfig.module.rules.find((rule) => Array.isArray(rule.oneOf))

      if (oneOfRule) {
        // Find and modify CSS module loader configuration
        oneOfRule.oneOf.forEach((rule) => {
          // Check if this rule handles CSS modules (module.scss or module.css)
          const isModuleRule =
            rule.test &&
            (rule.test.toString().includes('module') ||
              (rule.test.toString().includes('\\.module\\.') && rule.test.toString().includes('css')))

          if (isModuleRule && rule.use && Array.isArray(rule.use)) {
            rule.use.forEach((loader) => {
              // Handle object loader format
              if (typeof loader === 'object' && loader.loader) {
                const loaderPath = loader.loader
                if (loaderPath.includes('css-loader')) {
                  // Configure CSS modules with readable classnames in development
                  loader.options = loader.options || {}
                  loader.options.modules = loader.options.modules || {}
                  if (isDevelopment) {
                    // Use readable classnames: [filename]__[local]--[hash:base64:5]
                    // For newer css-loader versions, use getLocalIdent function
                    loader.options.modules.getLocalIdent = (context, localIdentName, localName) => {
                      // Return readable format: filename__localname--hash
                      const hash = require('crypto')
                        .createHash('md5')
                        .update(context.resourcePath + localName)
                        .digest('base64')
                        .substring(0, 5)
                      const filename = path.basename(context.resourcePath, path.extname(context.resourcePath))
                      return `${filename}__${localName}--${hash}`
                    }
                  }
                }
              }
            })
          }
        })

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
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}
