BEAUTIFY = @./node_modules/.bin/js-beautify --config ./style.json

JSFILES = $(wildcard lib/*.js) $(wildcard lib/*/*.js)

build:

format: $(JSFILES)
	$(BEAUTIFY) -r $^ 
