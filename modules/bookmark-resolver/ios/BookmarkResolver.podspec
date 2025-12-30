require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'BookmarkResolver'
  s.version        = package['version']
  s.summary        = 'iOS bookmark resolver for security-scoped resources'
  s.description    = 'Resolves iOS security-scoped bookmarks to restore access to directories'
  s.author         = ''
  s.license        = 'MIT'
  s.homepage       = 'https://github.com/example'
  s.platforms      = { :ios => '13.4' }
  s.swift_version  = '5.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift}'
end
