# ===========================================================================
# Project:   SproutWeb
# Copyright: ©2009 My Company, Inc.
# ===========================================================================

# Common build options for all pages goes here
config :all,
  :required => [:sproutcore, :shared_assets],
  :layout   => 'shared_assets:index.rhtml',
  :favicon  => 'favicon' # named asset

# shared_assets should not require itself  
config :shared_assets, :required => [:sproutcore]

mode :debug do
  config :all, :combine_stylesheets => false
end

# Production builds should reference the domain explicitly.  This way blogs
# and external templates work
mode :production do
  config :all, :url_prefix => 'http://www.sproutcore.com/static'
end
