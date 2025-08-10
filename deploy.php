<?php

namespace Deployer;

require 'recipe/laravel.php';

// Config

set('repository', 'git@github.com:nazirul-amin/doctor-assistant.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('194.233.83.230')
    ->set('remote_user', 'root')
    ->set('deploy_path', '/var/www/docuscribe');

// Tasks

task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'artisan:storage:link',
    'artisan:view:cache',
    'artisan:config:cache',
    'artisan:migrate',
    'npm:install',
    'npm:build',
    'deploy:publish',
])->desc('Deploy');

// NVM source location
set('nvm', 'source $HOME/.nvm/nvm.sh');

// Must be called in every run command related to npm
// Note: do not separate run command, as it is accounted as different shell session
set('use_nvm', function () {
    return '{{nvm}} && node --version && nvm use 23';
});

desc('Installs npm packages');
task('npm:install', function () {
    run('{{use_nvm}} && cd {{release_or_current_path}} && npm ci');
});

desc('Build production assets');
task('npm:build', function () {
    run('{{use_nvm}} && cd {{release_or_current_path}} && npm run build');
});

desc('reload php fpm');
task('reload:php-fpm', function () {
    run('service php8.3-fpm reload');
});

// Hooks
after('deploy:failed', 'deploy:unlock');
after('deploy', 'reload:php-fpm');
