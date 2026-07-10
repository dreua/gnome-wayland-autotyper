# Makefile for GNOME Shell Extension

UUID := autotyper@mbxnd.com
ZIP_NAME := $(UUID).zip

.PHONY: all clean zip compile

all: zip

compile:
	@echo "Compiling GSettings schemas..."
	@glib-compile-schemas schemas/

zip: compile clean
	@echo "Creating $(ZIP_NAME)..."
	@zip -r $(ZIP_NAME) extension.js metadata.json prefs.js schemas/
	@echo "Done! You can now upload $(ZIP_NAME) to extensions.gnome.org"

clean:
	@rm -f $(ZIP_NAME)
	@rm -f schemas/gschemas.compiled
