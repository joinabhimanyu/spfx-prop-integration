'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

const verifyAppSettings = require('./src/appSettingsGulp.js');

build.rig.addBuildTasks(verifyAppSettings);
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.initialize(gulp);
