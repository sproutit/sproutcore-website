# ===========================================================================
# Project:   SproutWeb
# Copyright: ©2009 My Company, Inc.
# ===========================================================================

# Common build options for all pages goes here
config :all,
  :required => [:sproutcore, :shared_assets],
  :layout   => 'shared_assets:index.rhtml'

# shared_assets should not require itself  
config :shared_assets, :required => [:sproutcore]

mode :debug do
  config :all, :combine_stylesheets => false
end
