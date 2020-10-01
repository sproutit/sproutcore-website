# Checkout copy of webpage from git and run a build.  Then push the build to
# www.sproutcore.com and symlink pages.
require 'extlib'

# Config Settings
LANGUAGES = [:en, :es, :de, :ru, :uk, :no, :fr, :ro]

# Autodetect some environment variables
SC_BUILD = '../abbot/bin/sc-build'
WORKING = File.dirname(__FILE__)

# discover the targets
TARGETS = Dir.glob(WORKING/'pages'/'*').map { |x| File.basename(x) }.uniq

# store global config options
OPTS = {}

# Make it so we can load Abbot as a library.  Once Abbot is installed as a 
# gem this 
$:
desc "builds the pages to prepare for deployment"
task :build do
  Dir.chdir WORKING
  puts `#{SC_BUILD} #{TARGETS * ' '} -rv --languages=#{LANGUAGES.join(',')}`
end

desc "cleans the build output"
task :clean do
  path = WORKING / 'tmp' / 'build' / 'production' / 'static'
  puts "removing #{path}"
  puts `rm -r #{path}`
end

desc "installs gems needed for this Rakefile to run"
task :install_gems do
  puts "sudo gem install highline net-ssh net-scp sproutit-sproutcore"
  puts `sudo gem install highline net-ssh net-scp sproutit-sproutcore`
end

desc "collects the login password from the operator"
task :collect_password do
  
  begin
    require 'highline/import'
  rescue LoadError => e
    puts "\n ~ FATAL: sproutcore gem is required.\n          Try: rake install_gems"
    exit(1)
  end
  
  puts "Enter login password for www.sproutcore.com to complete this task"
  OPTS[:password] = ask("Password: ") { |q| q.echo = '*' }
end

desc "finds all targets in the system and computes their build numbers" 
task :prepare_targets do
  
  begin
    require 'sproutcore'  
  rescue LoadError => e
    puts "\n ~ FATAL: sproutcore gem is required.\n          Try: rake install_gems"
    exit(1)
  end
  
  puts "discovering all instal targets"
  SC.build_mode = :production
  project = SC.load_project(WORKING) 
  
  # get all targets and prepare them so that build numbers work
  targets = TARGETS.map do |name| 
    target = project.target_for(name)
    [target] + target.expand_required_targets
  end
  targets = targets.flatten.compact.uniq
  
  puts "preparing build numbers"
  targets.each { |t| t.prepare!.compute_build_number }
  
  OPTS[:targets] = targets
  OPTS[:project] = project
end
  
    
desc "copies the built files onto the www.sproutcore.com server"
task :deploy_assets => [:collect_password, :build, :prepare_targets] do

  begin
    require 'net/ssh'
    require 'net/scp'  
  rescue LoadError => e
    puts "\n ~ FATAL: net-scp gem is required.\n          Try: rake install_gems"
    exit(1)
  end

  password = OPTS[:password]
  targets  = OPTS[:targets]
  
  installed = {}
  
  puts "building directory structures"
  Net::SSH.start('www.sproutcore.com', 'root', :password => password) do |ssh|
    targets.each do |target|
      LANGUAGES.each do |lang|
        remote_path = "/var/www/static#{target.index_root}/#{lang}"
        puts ssh.exec!(%[mkdir -p "#{remote_path}"]) || "%: mkdir -p #{remote_path}"
        
        # see if this guy is already installed
        remote_path = "#{remote_path}/#{target.build_number}"
        installed[remote_path] = !(ssh.exec!("ls #{remote_path}") =~ /No such file or directory/)
        
      end
    end
  end
        
  puts "copying static resources onto remote server"
  Net::SCP.start('www.sproutcore.com', 'root', :password => password) do |scp|

    targets.each do |target|
      LANGUAGES.each do |lang|
        local_path = target.build_root / lang / target.build_number
        remote_path = "/var/www/static#{target.index_root}/#{lang}"

        short_path = local_path.gsub /^#{Regexp.escape(target.build_root)}/,''

        if installed["#{remote_path}/#{target.build_number}"]
          puts " ~ #{target.target_name}#{short_path} already installed"
          
        elsif File.directory?(local_path)
          puts " ~ uploading #{target.target_name}#{short_path}"
          scp.upload! local_path, remote_path, :recursive => true

        else
          puts "\n\n ~ WARN: cannot install #{target.target_name}:#{lang} - local path #{local_path} does not exist\n\n"
        end
        
      end # LANGUAGES.each
    end # targets.each
  end # Net::SCP.start
  
end

desc "creates symlinks to the latest versions of all pages and apps. Make sure you deploy your assets also!"
task :link_current => [:collect_password, :prepare_targets] do

  # don't require unless this task runs to avoid dependency problems
  begin
    require 'net/ssh'
  rescue LoadError => e
    puts "\n ~ FATAL: net-ssh gem is required.\n          Try: rake install_gems"
    exit(1)
  end
    

  
  # now filter out only app targets living in the current project
  targets = OPTS[:targets]
  project = OPTS[:project]
  targets = targets.select { |t| t.target_type == :app }
  targets = targets.select do |t| 
    t.source_root =~ /^#{Regexp.escape(project.project_root)}/
  end

  puts "linking targets:\n  #{targets.map {|t| t.target_name} * "\n  " }"
  
  # SSH in and do the symlink
  password = OPTS[:password]
  Net::SSH.start('www.sproutcore.com', 'root', :password => password) do |ssh|
    targets.each do |target|
      # find the local build number
      build_number = target.prepare!.compute_build_number

      puts "Installing #{target.target_name}..."
      
      # first, link index.html
      from_path = "/var/www/static#{target.index_root}/en/#{build_number}/index.html"
      to_path   = "/var/www#{target.target_name}"
      
      puts ssh.exec!("mkdir -p #{to_path}") || "% mkdir -p #{to_path}"
      to_path = "#{to_path}/index.html"
      unless ssh.exec!("ls #{to_path}").empty? # check for existance
        puts ssh.exec!("rm #{to_path}") || " ~ Removed link at #{to_path}"
      end
      puts ssh.exec!("ln -s #{from_path} #{to_path}") || " ~ Linked #{from_path} => #{to_path}"

      # link each language
      LANGUAGES.each do |lang|
        from_path = "/var/www/static#{target.index_root}/#{lang}/#{build_number}"
        to_path   = "/var/www#{target.target_name}/#{lang}"

        puts " ~ installing language: #{lang}"
        unless ssh.exec!("ls #{to_path}").empty? # check for existance
          puts ssh.exec!("rm #{to_path}") || " ~ Removed link at #{to_path}"
        end
        puts ssh.exec!("ln -s #{from_path} #{to_path}") || " ~ Linked #{from_path} => #{to_path}"
      end
      
      # Also - this is for home only
      if target.target_name.to_s == '/home'
        to_path = '/var/www/index.html'
        from_path = "/var/www/static#{target.index_root}/en/#{build_number}/index.html"
        unless ssh.exec!("ls #{to_path}").empty? # check for existance
          puts ssh.exec!("rm #{to_path}") || " ~ Removed link at #{to_path}"
        end
        puts ssh.exec!("ln -s #{from_path} #{to_path}") || " ~ Linked #{from_path} => #{to_path}"
      end
        
    end
      
  end
  
end

desc "builds and then deploys the files to the server.  This will not clean the build first, which will be faster.  If you have trouble try deploy_clean"
task :deploy => [:collect_password, :build, :deploy_assets, :link_current]

desc "first cleans, then deploys the files"
task :deploy_clean => [:clean, :deploy]
  
  
