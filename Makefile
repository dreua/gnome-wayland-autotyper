# Makefile for GNOME Shell Extension

UUID := autotyper@mbxnd.com
ZIP_NAME := $(UUID).zip

.PHONY: all clean zip

all: zip

zip: clean
	@echo "Creating $(ZIP_NAME)..."
	@zip -r $(ZIP_NAME) extension.js metadata.json
	@echo "Done! You can now upload $(ZIP_NAME) to extensions.gnome.org"

clean:
	@rm -f $(ZIP_NAME)
