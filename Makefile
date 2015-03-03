NAME = postrest
PKG_VER = `cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
PKG_INFO = `cat package.json | grep -e '"version"' -e '"description"' -e '"logo"'`
LICENSE = `cat LICENSE`

BEAUTIFY = @./node_modules/.bin/js-beautify --config ./style.json
UGLIFYJS = @./node_modules/uglify-js/bin/uglifyjs
KARMA = @./node_modules/karma/bin/karma
MOCHA = @./node_modules/mocha/bin/mocha --timeout 5000 --require should --reporter spec
DUO = @./node_modules/duo/bin/duo

LIB = $(wildcard lib/*.js) $(wildcard lib/*/*.js)
TEST = $(wildcard test/*.js)

build: node_modules component
	@echo "${NAME} v${PKG_VER}"

node_modules:
	@echo "Installing node dependencies"
	@npm i -d

component: index.js
	@echo "Building web component"
	@mkdir -p build
	$(DUO) $< > build/build.js 

test-component: index.js
	@echo "Building test component"
	@mkdir -p build
	$(DUO) $< -g Arango --copy > build/test.js

test: test-nodejs

test-nodejs: node_modules
	@echo "Running tests for nodejs"
	$(MOCHA) 

test-browser: test-component
	@echo "Running tests for browser"
	$(KARMA) start ./test/karma/karma.conf.js

unit-test:
	@echo "testing module: $(module)"
	$(MOCHA) -g "module:${module}"

distclean:
	@echo "Cleaning up build files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build
	@rm -rf ./documentation

format: $(LIB) $(TEST)
	$(BEAUTIFY) -r $^ 

dist: component
	@echo "Beautify -> dist/$(NAME).js"
	$(UGLIFYJS) build/build.js --beautify --preamble "${LICENSE}" -o dist/$(NAME).js
	@echo "Uglify -> dist/$(NAME)-min.js"
	$(UGLIFYJS) dist/$(NAME).js --preamble "${LICENSE}" --prefix relative --source-map dist/$(NAME)-min.map.js -o dist/$(NAME)-min.js
	@echo "Compress -> dist/$(NAME)-min.js.gz"
	@gzip -9 -kf dist/$(NAME)-min.js

Release: dist
	@git tag -a $(PKG_VER) -m "v$(PKG_VER)" -f
	@echo "You may now push this release with: git push --tags"

publish:
	@npm publish

.PHONY: build