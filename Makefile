BEAUTIFY = @./node_modules/.bin/js-beautify --config ./style.json

JSFILES = $(wildcard **/*.js)

build:

format: $(JSFILES)
	$(BEAUTIFY) -r $^ 
