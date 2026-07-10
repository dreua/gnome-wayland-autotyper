# Makefile for GNOME Shell Extension

UUID := autotyper@mbxnd.com
ZIP_NAME := $(UUID).zip

.PHONY: all clean zip compile

all: zip

compile:
	@echo "Compiling GSettings schemas..."
	@glib-compile-schemas schemas/

zip: clean compile
	@echo "Creating $(ZIP_NAME)..."
	@python3 -c "import zipfile, os; \
		z = zipfile.ZipFile('$(ZIP_NAME)', 'w', zipfile.ZIP_DEFLATED); \
		[z.write(f) for f in ['extension.js', 'metadata.json', 'prefs.js']]; \
		[z.write(os.path.join('schemas', f)) for f in os.listdir('schemas') if f.endswith('.xml')]"
	@echo "Done! You can now upload $(ZIP_NAME) to extensions.gnome.org"

clean:
	@rm -f $(ZIP_NAME)
	@rm -f schemas/gschemas.compiled
