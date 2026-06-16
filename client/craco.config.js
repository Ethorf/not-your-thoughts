const path = require('path')

const appSrc = path.resolve(__dirname, 'src')

/**
 * Development-only CSS module class names that stay easy to read in DevTools:
 * path from src + original class, e.g. pages_EditNodeEntry_EditNodeEntry__wrapper
 * (Production still uses Create React App's default getCSSModuleLocalIdent.)
 */
function getReadableDevLocalIdent(context, _localIdentName, localName) {
  let rel = path.relative(appSrc, context.resourcePath).replace(/\\/g, '/')
  if (!rel || rel.startsWith('..')) {
    rel = path.basename(context.resourcePath)
  }
  const withoutModule = rel.replace(/\.module\.(scss|sass|css)$/i, '')
  const prefix = withoutModule.replace(/\//g, '_').replace(/[^a-zA-Z0-9_-]/g, '_')
  const combined = `${prefix}__${localName}`
  if (/^[0-9-]/.test(combined)) {
    return `m_${combined}`
  }
  return combined
}

function patchCssModuleLoadersForDev(rule, isDevelopment) {
  if (!isDevelopment || !rule) {
    return
  }
  if (Array.isArray(rule.oneOf)) {
    rule.oneOf.forEach((r) => patchCssModuleLoadersForDev(r, isDevelopment))
  }
  if (Array.isArray(rule.rules)) {
    rule.rules.forEach((r) => patchCssModuleLoadersForDev(r, isDevelopment))
  }

  const use = rule.use
  if (!use) {
    return
  }
  const chain = Array.isArray(use) ? use : [use]
  chain.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return
    }
    const loaderPath = String(item.loader || '')
    if (!loaderPath.includes('css-loader')) {
      return
    }
    const opts = item.options
    if (!opts || typeof opts !== 'object') {
      return
    }
    const mod = opts.modules
    if (!mod || typeof mod !== 'object') {
      return
    }
    const isCssModules = mod.mode === 'local' || typeof mod.getLocalIdent === 'function'
    if (!isCssModules) {
      return
    }
    item.options = {
      ...opts,
      modules: {
        ...mod,
        getLocalIdent: getReadableDevLocalIdent,
      },
    }
  })
}

module.exports = {
  devServer: {
    allowedHosts: 'all', // Allow all hosts (including ngrok)
  },
  webpack: {
    configure: (webpackConfig, { env }) => {
      const isDevelopment = env === 'development'

      const oneOfRule = webpackConfig.module.rules.find((rule) => Array.isArray(rule.oneOf))

      if (oneOfRule) {
        // Walk all rules so every css-loader that runs CSS Modules picks up dev naming
        patchCssModuleLoadersForDev(oneOfRule, isDevelopment)

        // Non-module SCSS only — must not match *.module.scss so CRA's sass module rule runs
        const sassLoader = {
          test: /\.scss$/,
          exclude: /\.module\.(scss|sass)$/,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                sourceMap: isDevelopment,
                modules: { mode: 'icss' },
              },
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sourceMap: true,
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src/styles')],
                },
              },
            },
          ],
          sideEffects: true,
        }

        oneOfRule.oneOf.unshift(sassLoader)
      }

      const resolveAlias = webpackConfig.resolve.alias || {}
      webpackConfig.resolve.alias = {
        ...resolveAlias,
        '@styles': path.resolve(__dirname, 'src/styles'),
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
